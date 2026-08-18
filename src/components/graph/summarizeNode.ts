import type { Edge, Graph, Node } from '../../schema'

export type ConnectionSummary = {
  edge: Edge
  otherNode: Node
  /** True when the edge points from the summarized node to otherNode. */
  outgoing: boolean
}

export type NodeSummary = {
  node: Node
  connections: ConnectionSummary[]
}

export function summarizeNode(graph: Graph, nodeId: string): NodeSummary | null {
  const node = graph.nodes.find((candidate) => candidate.id === nodeId)
  if (!node) return null

  const nodesById = new Map<string, Node>(graph.nodes.map((candidate) => [candidate.id, candidate]))
  const connections: ConnectionSummary[] = []
  for (const edge of graph.edges) {
    if (edge.from !== nodeId && edge.to !== nodeId) continue
    const outgoing = edge.from === nodeId
    const otherNode = nodesById.get(outgoing ? edge.to : edge.from)
    if (otherNode) {
      connections.push({ edge, otherNode, outgoing })
    }
  }
  return { node, connections }
}

export function formatEdgePeriod(edge: Edge): string {
  if (edge.start_date === null && edge.end_date === null) return ''
  const start = edge.start_date ?? '?'
  return edge.end_date === null ? `${start} – present` : `${start} – ${edge.end_date}`
}
