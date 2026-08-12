import { describe, expect, it } from 'vitest'
import fixture from '../../../data/graph.fixture.json'
import { GraphSchema } from '../../schema'
import { buildWeb, WEB_HEIGHT, WEB_WIDTH } from './buildWeb'

const graph = GraphSchema.parse(fixture)

describe('buildWeb', () => {
  it('places all nodes on one ring when there is no focus', () => {
    const web = buildWeb(graph, null)
    expect(web.nodes).toHaveLength(graph.nodes.length)
    expect(web.edges).toHaveLength(graph.edges.length)
  })

  it('puts the focus node at the center with depth 0', () => {
    const web = buildWeb(graph, 'company:stripe')
    const focus = web.nodes.find((webNode) => webNode.node.id === 'company:stripe')
    expect(focus).toBeDefined()
    expect(focus?.depth).toBe(0)
    expect(focus?.x).toBe(WEB_WIDTH / 2)
    expect(focus?.y).toBe(WEB_HEIGHT / 2)
  })

  it('assigns depth 1 to direct connections and depth 2 to two-hop neighbors', () => {
    const web = buildWeb(graph, 'company:stripe')
    const depthOf = (id: string) => web.nodes.find((webNode) => webNode.node.id === id)?.depth
    expect(depthOf('fund:sequoia-capital')).toBe(1)
    expect(depthOf('person:michael-moritz')).toBe(1)
    expect(depthOf('fund:andreessen-horowitz')).toBe(2)
  })

  it('excludes nodes more than two hops from the focus', () => {
    const web = buildWeb(graph, 'company:stripe')
    for (const webNode of web.nodes) {
      expect(webNode.depth).toBeLessThanOrEqual(2)
    }
  })

  it('only includes edges whose endpoints are both placed', () => {
    const web = buildWeb(graph, 'company:stripe')
    const placedIds = new Set<string>(web.nodes.map((webNode) => webNode.node.id))
    for (const webEdge of web.edges) {
      expect(placedIds.has(webEdge.edge.from)).toBe(true)
      expect(placedIds.has(webEdge.edge.to)).toBe(true)
    }
  })

  it('falls back to the full ring for an unknown focus id', () => {
    const web = buildWeb(graph, 'company:does-not-exist')
    expect(web.nodes).toHaveLength(graph.nodes.length)
  })
})
