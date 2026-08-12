import { describe, expect, it } from 'vitest'
import fixture from '../data/graph.fixture.json'
import { GraphSchema, type Graph } from '../src/schema/graph'
import { collectFailures, validateGraphFile } from './validate-graph'

const graph = (): Graph => GraphSchema.parse(fixture)

describe('collectFailures', () => {
  it('passes the hand-checked fixture', () => {
    expect(collectFailures(graph())).toEqual([])
  })

  it('reports edges referencing unknown node ids', () => {
    const g = graph()
    g.edges[0] = { ...g.edges[0], from: 'fund:does-not-exist' }
    const failures = collectFailures(g)
    expect(failures).toHaveLength(1)
    expect(failures[0]).toContain('unknown node id')
  })

  it('reports duplicate edge ids', () => {
    const g = graph()
    g.edges.push({ ...g.edges[0] })
    const failures = collectFailures(g)
    expect(failures.some((f) => f.includes('duplicate edge id'))).toBe(true)
  })

  it('reports end_date earlier than start_date', () => {
    const g = graph()
    g.edges[0] = { ...g.edges[0], start_date: '2020-05', end_date: '2019-01' }
    const failures = collectFailures(g)
    expect(failures.some((f) => f.includes('earlier than start_date'))).toBe(true)
  })

  it('reports every failure, not just the first', () => {
    const g = graph()
    g.edges[0] = { ...g.edges[0], from: 'fund:missing-a' }
    g.edges[1] = { ...g.edges[1], to: 'company:missing-b' }
    g.edges.push({ ...g.edges[2] })
    expect(collectFailures(g).length).toBeGreaterThanOrEqual(3)
  })
})

describe('validateGraphFile', () => {
  it('passes both committed graph files', () => {
    expect(validateGraphFile('data/graph.fixture.json')).toEqual([])
    expect(validateGraphFile('data/graph.json')).toEqual([])
  })

  it('reports a missing file', () => {
    const failures = validateGraphFile('data/no-such-file.json')
    expect(failures).toHaveLength(1)
    expect(failures[0]).toContain('could not read')
  })
})
