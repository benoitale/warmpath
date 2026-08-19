import { describe, expect, it } from 'vitest'
import type { AccountGraph, GraphEdge, GraphNode } from '../types'
import { EDGE_WEIGHTS, connectorOf, findPaths, parseEdgeDate, scoreEdge, scorePath } from './paths'

const NOW = new Date('2026-08-01T00:00:00Z')

const node = (id: string, overrides: Partial<GraphNode> = {}): GraphNode => ({
  id,
  type: 'company',
  name: id,
  ...overrides,
})

const edge = (overrides: Partial<GraphEdge> & Pick<GraphEdge, 'id' | 'source' | 'target'>): GraphEdge => ({
  type: 'invested_in',
  current: true,
  confidence: 'verified',
  ...overrides,
})

describe('parseEdgeDate', () => {
  it('parses year, year-month, and ISO forms', () => {
    expect(parseEdgeDate('2024')).toBe(Date.parse('2024-01-01T00:00:00Z'))
    expect(parseEdgeDate('2024-05')).toBe(Date.parse('2024-05-01T00:00:00Z'))
    expect(parseEdgeDate('2024-05-27T00:00:00Z')).toBe(Date.parse('2024-05-27T00:00:00Z'))
    expect(parseEdgeDate(undefined)).toBeNull()
    expect(parseEdgeDate('not a date')).toBeNull()
  })
})

describe('scoreEdge', () => {
  it('applies the not-current, inferred, and staleness modifiers multiplicatively', () => {
    const base = edge({ id: 'a', source: 'x', target: 'y', type: 'board_seat', startDate: '2025' })
    expect(scoreEdge(base, NOW)).toBe(EDGE_WEIGHTS.board_seat)

    const ended = edge({ ...base, current: false, endDate: '2025-06' })
    expect(scoreEdge(ended, NOW)).toBeCloseTo(5 * 0.5)

    const inferredEdge = edge({ ...base, confidence: 'inferred' })
    expect(scoreEdge(inferredEdge, NOW)).toBeCloseTo(5 * 0.6)

    const stale = edge({ ...base, startDate: '2005' })
    expect(scoreEdge(stale, NOW)).toBeCloseTo(5 * 0.8)

    const all = edge({ ...base, startDate: '2001', endDate: '2005', current: false, confidence: 'inferred' })
    expect(scoreEdge(all, NOW)).toBeCloseTo(5 * 0.5 * 0.6 * 0.8)
  })
})

describe('scorePath', () => {
  it('divides the summed weight by hops ^ 1.5', () => {
    const steps = [
      { edge: edge({ id: 'a', source: 'home', target: 'mid', type: 'board_seat' }), from: node('home'), to: node('mid') },
      { edge: edge({ id: 'b', source: 'mid', target: 'acct', type: 'board_seat' }), from: node('mid'), to: node('acct') },
    ]
    expect(scorePath(steps, NOW)).toBeCloseTo(10 / Math.pow(2, 1.5))
    expect(scorePath([], NOW)).toBe(0)
  })
})

describe('findPaths', () => {
  it('finds a 1-hop path', () => {
    const graph: AccountGraph = {
      nodes: [node('home'), node('acct', { isTargetAccount: true })],
      edges: [edge({ id: 'e1', source: 'acct', target: 'home', type: 'customer_of' })],
    }
    const paths = findPaths(graph, 'home', 'acct', { now: NOW })
    expect(paths).toHaveLength(1)
    expect(paths[0]?.hops).toBe(1)
    expect(paths[0]?.nodes.map((n) => n.id)).toEqual(['home', 'acct'])
    expect(paths[0]?.score).toBeCloseTo(EDGE_WEIGHTS.customer_of)
  })

  it('ranks a strong 2-hop path above a weak 3-hop path', () => {
    const graph: AccountGraph = {
      nodes: [node('home'), node('mid'), node('a'), node('b'), node('acct')],
      edges: [
        edge({ id: 'short-1', source: 'home', target: 'mid', type: 'board_seat' }),
        edge({ id: 'short-2', source: 'mid', target: 'acct', type: 'board_seat' }),
        edge({ id: 'long-1', source: 'home', target: 'a', type: 'co_invested_with' }),
        edge({ id: 'long-2', source: 'a', target: 'b', type: 'co_invested_with' }),
        edge({ id: 'long-3', source: 'b', target: 'acct', type: 'co_invested_with' }),
      ],
    }
    const paths = findPaths(graph, 'home', 'acct', { now: NOW })
    expect(paths).toHaveLength(2)
    expect(paths[0]?.hops).toBe(2)
    expect(paths[1]?.hops).toBe(3)
    expect(paths[0]?.score).toBeGreaterThan(paths[1]?.score ?? 0)
  })

  it('ranks a verified edge above an inferred edge of the same shape', () => {
    const graph: AccountGraph = {
      nodes: [node('home'), node('via-verified'), node('via-inferred'), node('acct')],
      edges: [
        edge({ id: 'v1', source: 'home', target: 'via-verified', type: 'led_round', startDate: '2026-01' }),
        edge({ id: 'v2', source: 'via-verified', target: 'acct', type: 'led_round', startDate: '2026-01' }),
        edge({ id: 'i1', source: 'home', target: 'via-inferred', type: 'led_round', startDate: '2026-01', confidence: 'inferred' }),
        edge({ id: 'i2', source: 'via-inferred', target: 'acct', type: 'led_round', startDate: '2026-01', confidence: 'inferred' }),
      ],
    }
    const paths = findPaths(graph, 'home', 'acct', { now: NOW })
    expect(paths).toHaveLength(2)
    expect(paths[0]?.nodes.map((n) => n.id)).toEqual(['home', 'via-verified', 'acct'])
    expect(paths[0]?.allVerified).toBe(true)
    expect(paths[1]?.allVerified).toBe(false)
  })

  it('returns an empty list when no path exists', () => {
    const graph: AccountGraph = {
      nodes: [node('home'), node('island'), node('acct')],
      edges: [edge({ id: 'e1', source: 'home', target: 'island' })],
    }
    expect(findPaths(graph, 'home', 'acct', { now: NOW })).toEqual([])
    expect(findPaths(graph, 'home', 'missing', { now: NOW })).toEqual([])
    expect(findPaths(graph, 'home', 'home', { now: NOW })).toEqual([])
  })

  it('honours maxHops and verifiedOnly, and never revisits a node', () => {
    const graph: AccountGraph = {
      nodes: [node('home'), node('a'), node('b'), node('c'), node('acct')],
      edges: [
        edge({ id: 'e1', source: 'home', target: 'a' }),
        edge({ id: 'e2', source: 'a', target: 'b' }),
        edge({ id: 'e3', source: 'b', target: 'c', confidence: 'inferred' }),
        edge({ id: 'e4', source: 'c', target: 'acct' }),
      ],
    }
    expect(findPaths(graph, 'home', 'acct', { now: NOW })).toHaveLength(1)
    expect(findPaths(graph, 'home', 'acct', { now: NOW, maxHops: 3 })).toEqual([])
    expect(findPaths(graph, 'home', 'acct', { now: NOW, verifiedOnly: true })).toEqual([])

    const path = findPaths(graph, 'home', 'acct', { now: NOW })[0]
    const ids = path?.nodes.map((n) => n.id) ?? []
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('tie-breaks equal scores on the most recent edge date', () => {
    const graph: AccountGraph = {
      nodes: [node('home'), node('older'), node('newer'), node('acct')],
      edges: [
        edge({ id: 'o1', source: 'home', target: 'older', type: 'partner_of', startDate: '2020-01' }),
        edge({ id: 'o2', source: 'older', target: 'acct', type: 'partner_of', startDate: '2020-01' }),
        edge({ id: 'n1', source: 'home', target: 'newer', type: 'partner_of', startDate: '2026-01' }),
        edge({ id: 'n2', source: 'newer', target: 'acct', type: 'partner_of', startDate: '2026-01' }),
      ],
    }
    const paths = findPaths(graph, 'home', 'acct', { now: NOW })
    expect(paths[0]?.nodes.map((n) => n.id)).toEqual(['home', 'newer', 'acct'])
    expect(paths[0]?.latestEdgeDate).toBe('2026-01')
  })
})

describe('connectorOf', () => {
  it('prefers a person in the middle of the path', () => {
    const graph: AccountGraph = {
      nodes: [
        node('home'),
        node('fund', { type: 'firm' }),
        node('human', { type: 'person', name: 'Human' }),
        node('acct'),
      ],
      edges: [
        edge({ id: 'e1', source: 'home', target: 'fund', type: 'led_round' }),
        edge({ id: 'e2', source: 'fund', target: 'human', type: 'employed_at' }),
        edge({ id: 'e3', source: 'human', target: 'acct', type: 'board_seat' }),
      ],
    }
    const path = findPaths(graph, 'home', 'acct', { now: NOW })[0]
    expect(path).toBeDefined()
    expect(path === undefined ? null : connectorOf(path)?.id).toBe('human')
  })
})
