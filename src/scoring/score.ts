import type { Edge, Graph } from '../schema'

export type PathStep = {
  edge: Edge
  fromNodeId: string
  toNodeId: string
}

export type ScoredPath = {
  targetCompanyId: string
  /** 1 or 2 steps, never more. */
  steps: PathStep[]
  score: number
  reasons: string[]
}

export function scorePaths(graph: Graph, targetCompanyId: string, now: Date): ScoredPath[] {
  void graph
  void targetCompanyId
  void now
  return []
}
