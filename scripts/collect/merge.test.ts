import { describe, expect, it } from 'vitest'
import { buildCognitionFinservFragment } from './curated/cognitionFinserv'
import { mergeFragments } from './merge'
import { collectFailures } from '../validate-graph'

describe('mergeFragments + curated FinServ graph', () => {
  it('builds a schema-valid Cognition × FinServ graph with sourced edges only', () => {
    const fragment = buildCognitionFinservFragment('2026-08-22')
    const { graph, dropped } = mergeFragments([fragment], {
      generatedAt: '2026-08-22T01:00:00Z',
      version: '0.2.0',
    })

    expect(graph.nodes.some((node) => node.id === 'company:sei-investments')).toBe(true)
    expect(graph.nodes.some((node) => node.id === 'company:apollo-global')).toBe(true)
    expect(graph.nodes.some((node) => node.id === 'company:cantor-fitzgerald')).toBe(true)
    expect(graph.nodes.some((node) => node.id === 'company:oppenheimer-holdings')).toBe(true)

    expect(graph.edges.every((edge) => edge.source_url.startsWith('http'))).toBe(true)
    expect(collectFailures(graph)).toEqual([])
    expect(dropped.some((note) => note.includes('No public sourced edge'))).toBe(true)

    // Alumni bridge that makes Apollo demo-able: Goldman customer → Cohn → Apollo board
    expect(graph.edges.some((edge) => edge.id === 'edge:cohn-goldman-exec')).toBe(true)
    expect(graph.edges.some((edge) => edge.id === 'edge:cohn-apollo-board')).toBe(true)
    expect(graph.edges.some((edge) => edge.id === 'edge:goldman-cognition-customer')).toBe(true)
  })
})
