import type { AccountSummary, PathStep } from './paths'

type AskTemplate = {
  label: string
  text: (connectorName: string, accountName: string) => string
}

const ASK_TEMPLATES: Record<string, AskTemplate> = {
  board: {
    label: 'board relationship',
    text: (connectorName, accountName) =>
      `Ask ${connectorName} for an introduction to ${accountName} based on their board relationship.`,
  },
  formerOperator: {
    label: 'former operator relationship',
    text: (connectorName, accountName) =>
      `Ask ${connectorName} for an introduction to ${accountName} based on their former operator relationship.`,
  },
  investor: {
    label: 'shared investor relationship',
    text: (connectorName, accountName) =>
      `Ask ${connectorName} for an introduction to ${accountName} based on their shared investor relationship.`,
  },
  customerReference: {
    label: 'customer reference relationship',
    text: (connectorName, accountName) =>
      `Ask ${connectorName} for an introduction to ${accountName} based on their customer reference relationship.`,
  },
}

function connectorAccountStep(summary: AccountSummary): PathStep | null {
  const connector = summary.connector
  if (connector === null || summary.bestPath === null) {
    return null
  }

  return (
    summary.bestPath.steps.find(
      (step) =>
        (step.from.id === connector.id && step.to.id === summary.account.id) ||
        (step.to.id === connector.id && step.from.id === summary.account.id),
    ) ?? null
  )
}

function templateForStep(step: PathStep): AskTemplate | null {
  if (step.edge.type === 'board_seat' || step.edge.type === 'chairman_of') {
    return ASK_TEMPLATES.board
  }

  if (
    (step.edge.type === 'employed_at' || step.edge.type === 'founded') &&
    step.edge.current === false
  ) {
    return ASK_TEMPLATES.formerOperator
  }

  if (
    step.edge.type === 'invested_in' ||
    step.edge.type === 'led_round' ||
    step.edge.type === 'co_invested_with'
  ) {
    return ASK_TEMPLATES.investor
  }

  if (step.edge.type === 'customer_of' || step.edge.type === 'partner_of') {
    return ASK_TEMPLATES.customerReference
  }

  return null
}

export function suggestedAsk(summary: AccountSummary): string | null {
  const step = connectorAccountStep(summary)
  if (step === null || summary.connector === null) {
    return null
  }

  const template = templateForStep(step)
  return template?.text(summary.connector.name, summary.account.name) ?? null
}
