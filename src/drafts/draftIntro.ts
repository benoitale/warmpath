import type { Graph } from '../schema'
import type { ScoredPath } from '../scoring'

export type IntroDraft = {
  subject: string
  body: string
  forwardable: string
}

export function draftIntro(path: ScoredPath, graph: Graph): IntroDraft {
  void path
  void graph
  return { subject: '', body: '', forwardable: '' }
}
