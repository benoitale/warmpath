import { describe, expect, it } from 'vitest'
import fixture from '../../../data/graph.fixture.json'
import { GraphSchema } from '../../schema'
import { formatEdgePeriod, summarizeNode } from './summarizeNode'

const graph = GraphSchema.parse(fixture)

describe('summarizeNode', () => {
  it('returns the node and all edges touching it, in either direction', () => {
    const summary = summarizeNode(graph, 'company:stripe')
    expect(summary).not.toBeNull()
    expect(summary?.node.id).toBe('company:stripe')
    const expected = graph.edges.filter(
      (edge) => edge.from === 'company:stripe' || edge.to === 'company:stripe',
    )
    expect(summary?.connections).toHaveLength(expected.length)
  })

  it('marks direction relative to the summarized node', () => {
    const summary = summarizeNode(graph, 'fund:sequoia-capital')
    for (const connection of summary?.connections ?? []) {
      if (connection.outgoing) {
        expect(connection.edge.from).toBe('fund:sequoia-capital')
      } else {
        expect(connection.edge.to).toBe('fund:sequoia-capital')
      }
      expect(connection.otherNode.id).not.toBe('fund:sequoia-capital')
    }
  })

  it('returns null for an unknown node id', () => {
    expect(summarizeNode(graph, 'company:does-not-exist')).toBeNull()
  })
})

describe('formatEdgePeriod', () => {
  const base = graph.edges[0]

  it('formats an ongoing relationship', () => {
    expect(formatEdgePeriod({ ...base, start_date: '2011-03', end_date: null })).toBe(
      '2011-03 – present',
    )
  })

  it('formats an ended relationship', () => {
    expect(formatEdgePeriod({ ...base, start_date: '2011-01', end_date: '2021-07' })).toBe(
      '2011-01 – 2021-07',
    )
  })

  it('returns an empty string when no dates are recorded', () => {
    expect(formatEdgePeriod({ ...base, start_date: null, end_date: null })).toBe('')
  })
})
