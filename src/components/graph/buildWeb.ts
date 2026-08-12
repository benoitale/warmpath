import type { Edge, Graph, Node } from '../../schema'

export type WebNode = {
  node: Node
  x: number
  y: number
  /** 0 = focus, 1 = direct connection, 2 = two hops out. */
  depth: number
}

export type WebEdge = {
  edge: Edge
  from: WebNode
  to: WebNode
}

export type Web = {
  nodes: WebNode[]
  edges: WebEdge[]
}

export const WEB_WIDTH = 840
export const WEB_HEIGHT = 620

const CENTER_X = WEB_WIDTH / 2
const CENTER_Y = WEB_HEIGHT / 2
const RING_RADIUS = [0, 170, 275]

function placeRing(nodes: Node[], depth: number): WebNode[] {
  const radius = RING_RADIUS[Math.min(depth, RING_RADIUS.length - 1)]
  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1) - Math.PI / 2
    return {
      node,
      x: CENTER_X + radius * Math.cos(angle),
      y: CENTER_Y + radius * Math.sin(angle),
      depth,
    }
  })
}

export function buildWeb(graph: Graph, focusNodeId: string | null): Web {
  const nodesById = new Map<string, Node>(graph.nodes.map((node) => [node.id, node]))

  let placed: WebNode[]
  if (focusNodeId !== null && nodesById.has(focusNodeId)) {
    const depths = new Map<string, number>([[focusNodeId, 0]])
    let frontier = [focusNodeId]
    for (let depth = 1; depth <= 2; depth++) {
      const next: string[] = []
      for (const edge of graph.edges) {
        for (const [a, b] of [
          [edge.from, edge.to],
          [edge.to, edge.from],
        ]) {
          if (frontier.includes(a) && !depths.has(b) && nodesById.has(b)) {
            depths.set(b, depth)
            next.push(b)
          }
        }
      }
      frontier = next
    }
    placed = [0, 1, 2].flatMap((depth) =>
      placeRing(
        graph.nodes.filter((node) => depths.get(node.id) === depth),
        depth,
      ),
    )
  } else {
    placed = placeRing(graph.nodes, 1).map((webNode) => ({ ...webNode, depth: 1 }))
  }

  const placedById = new Map<string, WebNode>(placed.map((webNode) => [webNode.node.id, webNode]))
  const edges: WebEdge[] = []
  for (const edge of graph.edges) {
    const from = placedById.get(edge.from)
    const to = placedById.get(edge.to)
    if (from && to) {
      edges.push({ edge, from, to })
    }
  }

  return { nodes: placed, edges }
}
