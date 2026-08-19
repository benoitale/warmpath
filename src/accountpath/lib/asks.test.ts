import { describe, expect, it } from 'vitest'
import type { AccountSummary, PathStep } from './paths'
import { suggestedAsk } from './asks'

const home = { id: 'home', type: 'company' as const, name: 'Home' }
const connector = { id: 'connector', type: 'person' as const, name: 'Connector' }
const account = { id: 'account', type: 'company' as const, name: 'Account' }

function summary(step: PathStep): AccountSummary {
  const path = {
    steps: [step],
    nodes: [home, connector, account],
    hops: 1,
    score: 1,
    latestEdgeDate: null,
    allVerified: true,
  }
  return {
    account,
    status: 'warm-path',
    bestPath: path,
    paths: [path],
    connector,
  }
}

describe('suggestedAsk', () => {
  it.each([
    ['board_seat', true, 'board relationship'],
    ['chairman_of', true, 'board relationship'],
    ['employed_at', false, 'former operator relationship'],
    ['founded', false, 'former operator relationship'],
    ['invested_in', true, 'shared investor relationship'],
    ['led_round', true, 'shared investor relationship'],
    ['co_invested_with', true, 'shared investor relationship'],
    ['customer_of', true, 'customer reference relationship'],
    ['partner_of', true, 'customer reference relationship'],
  ] as const)('uses the %s template branch', (type, current, relationship) => {
    const edge = {
      id: 'edge',
      source: 'connector',
      target: 'account',
      type,
      current,
      confidence: 'verified' as const,
    }

    expect(suggestedAsk(summary({ edge, from: connector, to: account }))).toBe(
      `Ask Connector for an introduction to Account based on their ${relationship}.`,
    )
  })

  it('returns null when there is no path', () => {
    expect(
      suggestedAsk({
        account,
        status: 'cold',
        bestPath: null,
        paths: [],
        connector: null,
      }),
    ).toBeNull()
  })

  it('returns null when the connector relationship is not a supported template', () => {
    const edge = {
      id: 'edge',
      source: 'connector',
      target: 'account',
      type: 'acquired' as const,
      current: true,
      confidence: 'verified' as const,
    }

    expect(suggestedAsk(summary({ edge, from: connector, to: account }))).toBeNull()
  })
})
