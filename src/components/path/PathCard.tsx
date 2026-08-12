import type { Graph } from '../../schema'
import type { ScoredPath } from '../../scoring'

export type PathCardProps = {
  path: ScoredPath
  graph: Graph
}

export function PathCard({ path, graph }: PathCardProps) {
  void path
  void graph
  return null
}
