import { describe, expect, it } from 'vitest'
import type { AccountGraph, GraphEdge, GraphNode } from '../types'
import { validateEdgeDraft, validateNodeDraft } from './validation'

const graph: AccountGraph = {
  nodes: [
    { id: 'home', type: 'company', name: 'Home' },
    { id: 'account', type: 'company', name: 'Account' },
  ],
  edges: [],
}

const validEdge: GraphEdge = {
  id: 'edge',
  source: 'home',
  target: 'account',
  type: 'partner_of',
  current: true,
  confidence: 'verified',
  sourceUrl: 'https://example.com/source',
}

describe('validateNodeDraft', () => {
  it('accepts a valid new node and allows the current node during edits', () => {
    const node: GraphNode = { id: 'new', type: 'person', name: 'New' }
    expect(validateNodeDraft(node, graph)).toEqual([])
    expect(validateNodeDraft(graph.nodes[0] as GraphNode, graph, 'home')).toEqual([])
  })

  it('rejects duplicate node IDs', () => {
    expect(validateNodeDraft({ ...graph.nodes[0] } as GraphNode, graph)).toContain(
      'A node with this ID already exists.',
    )
  })
})

describe('validateEdgeDraft', () => {
  it('accepts a valid edge', () => {
    expect(validateEdgeDraft(validEdge, graph)).toEqual([])
  })

  it('rejects verified edges without a source URL', () => {
    expect(validateEdgeDraft({ ...validEdge, sourceUrl: '' }, graph)).toContain(
      'Verified edges require a source URL.',
    )
    expect(validateEdgeDraft({ ...validEdge, sourceUrl: undefined }, graph)).toContain(
      'Verified edges require a source URL.',
    )
  })

  it('rejects edges whose endpoints do not exist', () => {
    const errors = validateEdgeDraft({ ...validEdge, source: 'missing' }, graph)
    expect(errors).toContain('Edge source must match an existing node ID.')
  })

  it('allows the current edge ID during edits', () => {
    expect(validateEdgeDraft(validEdge, { ...graph, edges: [validEdge] }, 'edge')).toEqual([])
  })
})
