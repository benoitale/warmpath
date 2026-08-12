import { describe, expect, it } from 'vitest'
import fixture from '../../data/graph.fixture.json'
import { EdgeSchema, GraphSchema } from './graph'

describe('GraphSchema', () => {
  it('parses the hand-checked fixture', () => {
    const parsed = GraphSchema.safeParse(fixture)
    expect(parsed.success).toBe(true)
  })

  it('covers every node type and every edge type in the fixture', () => {
    const graph = GraphSchema.parse(fixture)
    const nodeTypes = new Set(graph.nodes.map((node) => node.type))
    expect(nodeTypes).toEqual(new Set(['fund', 'company', 'person']))
    const edgeTypes = new Set(graph.edges.map((edge) => edge.type))
    expect(edgeTypes).toEqual(
      new Set([
        'board_seat',
        'investor_portfolio',
        'exec_employment',
        'co_investor',
        'customer_reference',
        'cohort',
      ]),
    )
  })

  it('rejects node ids without the type prefix', () => {
    const result = GraphSchema.shape.nodes.element.safeParse({
      id: 'stripe',
      type: 'company',
      name: 'Stripe',
      aliases: [],
      is_target: true,
      is_customer: false,
      tier: 1,
      industry: 'Fintech',
      employee_band: '5001-10000',
    })
    expect(result.success).toBe(false)
  })

  it('rejects edges with a non-http(s) source_url', () => {
    const base = GraphSchema.parse(fixture).edges[0]
    expect(EdgeSchema.safeParse({ ...base, source_url: 'ftp://example.com/x' }).success).toBe(false)
    expect(EdgeSchema.safeParse({ ...base, source_url: 'not a url' }).success).toBe(false)
    expect(EdgeSchema.safeParse({ ...base, source_url: '' }).success).toBe(false)
  })
})
