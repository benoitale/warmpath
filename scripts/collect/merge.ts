import { GraphSchema, type Edge, type Graph, type Node } from '../../src/schema/graph'
import type { GraphFragment, MergeOptions } from './types'

function assertUniqueIds(kind: string, ids: string[]): string[] {
  const seen = new Set<string>()
  const failures: string[] = []
  for (const id of ids) {
    if (seen.has(id)) failures.push(`duplicate ${kind} id after merge: ${id}`)
    seen.add(id)
  }
  return failures
}

/**
 * Merge collector fragments into a single Graph.
 * First writer wins for node/edge ids; later duplicates are recorded in `dropped`.
 */
export function mergeFragments(
  fragments: GraphFragment[],
  options: MergeOptions,
): { graph: Graph; dropped: string[] } {
  const nodesById = new Map<string, Node>()
  const edgesById = new Map<string, Edge>()
  const dropped: string[] = []

  for (const fragment of fragments) {
    dropped.push(...fragment.dropped.map((note) => `[${fragment.collector}] ${note}`))

    for (const node of fragment.nodes) {
      const { collector: _collector, ...nodeRest } = node
      void _collector
      if (nodesById.has(nodeRest.id)) {
        dropped.push(`[${fragment.collector}] skipped duplicate node ${nodeRest.id}`)
        continue
      }
      nodesById.set(nodeRest.id, nodeRest)
    }

    for (const edge of fragment.edges) {
      const { collector: _collector, ...edgeRest } = edge
      void _collector
      if (edgesById.has(edgeRest.id)) {
        dropped.push(`[${fragment.collector}] skipped duplicate edge ${edgeRest.id}`)
        continue
      }
      edgesById.set(edgeRest.id, edgeRest)
    }
  }

  const graphCandidate = {
    version: options.version ?? '0.2.0',
    generated_at: options.generatedAt,
    nodes: [...nodesById.values()],
    edges: [...edgesById.values()],
  }

  const idFailures = [
    ...assertUniqueIds('node', graphCandidate.nodes.map((node) => node.id)),
    ...assertUniqueIds('edge', graphCandidate.edges.map((edge) => edge.id)),
  ]
  if (idFailures.length > 0) {
    throw new Error(idFailures.join('; '))
  }

  const parsed = GraphSchema.safeParse(graphCandidate)
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
    )
  }

  return { graph: parsed.data, dropped }
}
