import type { Graph } from '../../schema'

export type GraphViewProps = {
  graph: Graph
  focusCompanyId: string | null
}

export function GraphView({ graph, focusCompanyId }: GraphViewProps) {
  void graph
  void focusCompanyId
  return null
}
