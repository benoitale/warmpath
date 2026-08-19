import type { AccountGraph, GraphEdge, GraphNode } from '../types'

export function validateNodeDraft(
  node: GraphNode,
  graph: AccountGraph,
  originalId?: string,
): string[] {
  const errors: string[] = []
  if (node.id.trim() === '') {
    errors.push('Node ID is required.')
  }
  if (node.name.trim() === '') {
    errors.push('Node name is required.')
  }
  const duplicate = graph.nodes.some(
    (candidate) => candidate.id === node.id && candidate.id !== originalId,
  )
  if (duplicate) {
    errors.push('A node with this ID already exists.')
  }
  return errors
}

export function validateEdgeDraft(
  edge: GraphEdge,
  graph: AccountGraph,
  originalId?: string,
): string[] {
  const errors: string[] = []
  if (edge.id.trim() === '') {
    errors.push('Edge ID is required.')
  }
  if (edge.source.trim() === '' || graph.nodes.every((node) => node.id !== edge.source)) {
    errors.push('Edge source must match an existing node ID.')
  }
  if (edge.target.trim() === '' || graph.nodes.every((node) => node.id !== edge.target)) {
    errors.push('Edge target must match an existing node ID.')
  }
  if (edge.source === edge.target && edge.source !== '') {
    errors.push('Edge source and target must be different nodes.')
  }
  if (edge.confidence === 'verified' && (edge.sourceUrl === undefined || edge.sourceUrl.trim() === '')) {
    errors.push('Verified edges require a source URL.')
  }
  const duplicate = graph.edges.some(
    (candidate) => candidate.id === edge.id && candidate.id !== originalId,
  )
  if (duplicate) {
    errors.push('An edge with this ID already exists.')
  }
  return errors
}
