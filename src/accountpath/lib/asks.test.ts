import { describe, expect, it } from 'vitest'
import type { AccountSummary, PathStep } from './paths'
import { suggestedAsk } from './asks'

const home = { id: 'home', type: 'company' as const, name: 'Home' }
const connector = { id: 'connector', type: 'person' as const, name: 'Connector' }
const account = { id: 'account', type: 'company' as const, name: 'Account' }

function summary(step: PathStep, ourStep: PathStep): AccountSummary {
  const path = {
    steps: [ourStep, step],
    nodes: [home, connector, account],
    hops: 2,
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
  it('uses the board relationship template branch', () => {
    const edge = {
      id: 'edge',
      source: 'connector',
      target: 'account',
      type: 'board_seat' as const,
      current: true,
      confidence: 'verified' as const,
      startDate: '2022',
      note: 'Board member',
    }
    const ourEdge = {
      id: 'our-edge',
      source: 'home',
      target: 'connector',
      type: 'led_round' as const,
      current: true,
      confidence: 'verified' as const,
      startDate: '2026-05',
    }

    expect(suggestedAsk(summary({ edge, from: connector, to: account }, { edge: ourEdge, from: home, to: connector }))).toBe(
      'Ask Connector for an introduction to Account. Home reaches Connector through led_round (2026-05). Connector reaches Account through their board relationship: board_seat (2022): Board member.',
    )
  })

  it('uses the former operator relationship template branch', () => {
    const edge = {
      id: 'edge',
      source: 'connector',
      target: 'account',
      type: 'employed_at' as const,
      current: false,
      confidence: 'verified' as const,
      endDate: '2018',
    }
    const ourEdge = {
      id: 'our-edge',
      source: 'home',
      target: 'connector',
      type: 'customer_of' as const,
      current: true,
      confidence: 'verified' as const,
    }

    expect(suggestedAsk(summary({ edge, from: connector, to: account }, { edge: ourEdge, from: home, to: connector }))).toContain(
      'former operator relationship: employed_at (2018)',
    )
  })

  it('uses the shared investor relationship template branch', () => {
    const edge = {
      id: 'edge',
      source: 'connector',
      target: 'account',
      type: 'invested_in' as const,
      current: true,
      confidence: 'verified' as const,
    }
    const ourEdge = {
      id: 'our-edge',
      source: 'home',
      target: 'connector',
      type: 'partner_of' as const,
      current: true,
      confidence: 'verified' as const,
    }

    expect(suggestedAsk(summary({ edge, from: connector, to: account }, { edge: ourEdge, from: home, to: connector }))).toContain(
      'shared investor relationship: invested_in.',
    )
  })

  it('uses the customer reference relationship template branch', () => {
    const edge = {
      id: 'edge',
      source: 'connector',
      target: 'account',
      type: 'customer_of' as const,
      current: true,
      confidence: 'verified' as const,
    }
    const ourEdge = {
      id: 'our-edge',
      source: 'home',
      target: 'connector',
      type: 'board_seat' as const,
      current: true,
      confidence: 'verified' as const,
    }

    expect(suggestedAsk(summary({ edge, from: connector, to: account }, { edge: ourEdge, from: home, to: connector }))).toContain(
      'customer reference relationship: customer_of.',
    )
  })

  it('handles a direct one-hop relationship without an intermediary', () => {
    const edge = {
      id: 'edge',
      source: 'account',
      target: 'home',
      type: 'customer_of' as const,
      current: true,
      confidence: 'verified' as const,
      startDate: '2026-06',
    }

    const path = {
      steps: [{ edge, from: home, to: account }],
      nodes: [home, account],
      hops: 1,
      score: 1,
      latestEdgeDate: '2026-06',
      allVerified: true,
    }

    expect(
      suggestedAsk({
        account,
        status: 'warm-path',
        bestPath: path,
        paths: [path],
        connector: null,
      }),
    ).toBe('No intermediary is needed: Account already relates to Home through customer_of (2026-06).')
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
})
