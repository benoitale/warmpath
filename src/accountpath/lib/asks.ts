import type { AccountSummary, PathStep } from './paths'

type AskTemplateKey = 'board' | 'formerOperator' | 'investor' | 'customerReference'

type AskTemplate = {
  relationship: string
  text: (context: AskContext) => string
}

type AskContext = {
  homeName: string
  connectorName: string
  accountName: string
  ourLeg: PathStep[]
  connectorLeg: PathStep
}

const ASK_TEMPLATES: Record<AskTemplateKey, AskTemplate> = {
  board: {
    relationship: 'board relationship',
    text: (context) =>
      askWithRelationship(context, 'board relationship'),
  },
  formerOperator: {
    relationship: 'former operator relationship',
    text: (context) =>
      askWithRelationship(context, 'former operator relationship'),
  },
  investor: {
    relationship: 'shared investor relationship',
    text: (context) =>
      askWithRelationship(context, 'shared investor relationship'),
  },
  customerReference: {
    relationship: 'customer reference relationship',
    text: (context) =>
      askWithRelationship(context, 'customer reference relationship'),
  },
}

function edgeDate(step: PathStep): string | null {
  if (step.edge.startDate === undefined && step.edge.endDate === undefined) return null
  if (step.edge.startDate === undefined) return step.edge.endDate ?? null
  if (step.edge.endDate === undefined) return step.edge.startDate
  return `${step.edge.startDate}–${step.edge.endDate}`
}

function describeStep(step: PathStep): string {
  const date = edgeDate(step)
  const note = step.edge.note
  return `${step.edge.type}${date === null ? '' : ` (${date})`}${note === undefined ? '' : `: ${note}`}`
}

function describeLegs(steps: PathStep[]): string {
  return steps.map(describeStep).join('; ')
}

function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function connectorAccountStep(summary: AccountSummary): {
  connectorIndex: number
  step: PathStep
} | null {
  const connector = summary.connector
  if (connector === null || summary.bestPath === null) {
    return null
  }

  const connectorIndex = summary.bestPath.nodes.findIndex((node) => node.id === connector.id)
  if (connectorIndex < 1 || connectorIndex >= summary.bestPath.nodes.length - 1) return null

  const step = summary.bestPath.steps[connectorIndex]
  if (
    step === undefined ||
    !(
      (step.from.id === connector.id && step.to.id === summary.account.id) ||
      (step.to.id === connector.id && step.from.id === summary.account.id)
    )
  ) {
    return null
  }

  return { connectorIndex, step }
}

function templateForStep(step: PathStep): AskTemplateKey | null {
  if (step.edge.type === 'board_seat' || step.edge.type === 'chairman_of') {
    return 'board'
  }

  if (
    (step.edge.type === 'employed_at' || step.edge.type === 'founded') &&
    step.edge.current === false
  ) {
    return 'formerOperator'
  }

  if (
    step.edge.type === 'invested_in' ||
    step.edge.type === 'led_round' ||
    step.edge.type === 'co_invested_with'
  ) {
    return 'investor'
  }

  if (step.edge.type === 'customer_of' || step.edge.type === 'partner_of') {
    return 'customerReference'
  }

  return null
}

function askWithRelationship(context: AskContext, relationship: string): string {
  return [
    `Ask ${context.connectorName} for an introduction to ${context.accountName}`,
    `${context.homeName} reaches ${context.connectorName} through ${describeLegs(context.ourLeg)}`,
    `${context.connectorName} reaches ${context.accountName} through their ${relationship}: ${describeStep(context.connectorLeg)}`,
  ]
    .map(sentence)
    .join(' ')
}

export function suggestedAsk(summary: AccountSummary): string | null {
  if (summary.bestPath === null) {
    return null
  }

  if (summary.bestPath.steps.length === 1) {
    const directStep = summary.bestPath.steps[0]
    if (directStep === undefined) return null
    return `No intermediary is needed: ${summary.account.name} already relates to ${summary.bestPath.nodes[0]?.name ?? 'the home company'} through ${describeStep(directStep)}.`
  }

  const relationship = connectorAccountStep(summary)
  if (relationship === null || summary.connector === null) {
    return null
  }

  const templateKey = templateForStep(relationship.step)
  if (templateKey === null) {
    return null
  }

  const context: AskContext = {
    homeName: summary.bestPath.nodes[0]?.name ?? 'the home company',
    connectorName: summary.connector.name,
    accountName: summary.account.name,
    ourLeg: summary.bestPath.steps.slice(0, relationship.connectorIndex),
    connectorLeg: relationship.step,
  }
  return ASK_TEMPLATES[templateKey].text(context)
}
