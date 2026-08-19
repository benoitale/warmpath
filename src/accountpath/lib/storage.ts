import { seedGraph } from '../data/graph'
import type { AccountGraph, EdgeType, GraphEdge, GraphNode, NodeType, Segment } from '../types'

export const ACCOUNT_GRAPH_STORAGE_KEY = 'accountpath.graph'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const nodeTypes: readonly NodeType[] = ['person', 'firm', 'company']
const segments: readonly Segment[] = [
  'money-center-bank',
  'asset-management',
  'trading',
  'market-infrastructure',
  'insurance',
  'fintech',
  'crypto',
  'vendor',
  'investor',
  'internal',
]
const edgeTypes: readonly EdgeType[] = [
  'founded',
  'employed_at',
  'board_seat',
  'chairman_of',
  'invested_in',
  'led_round',
  'co_invested_with',
  'customer_of',
  'partner_of',
  'acquired',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isOneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return isString(value) && values.includes(value as T)
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || isString(value)
}

function isOptionalBoolean(value: unknown): boolean {
  return value === undefined || typeof value === 'boolean'
}

function isGraphNode(value: unknown): value is GraphNode {
  if (!isRecord(value)) {
    return false
  }

  return (
    isString(value.id) &&
    isOneOf(nodeTypes, value.type) &&
    isString(value.name) &&
    (value.segment === undefined || isOneOf(segments, value.segment)) &&
    isOptionalString(value.role) &&
    isOptionalString(value.hq) &&
    isOptionalBoolean(value.isTargetAccount) &&
    isOptionalBoolean(value.isExistingCustomer) &&
    isOptionalString(value.notes)
  )
}

function isGraphEdge(value: unknown): value is GraphEdge {
  if (!isRecord(value)) {
    return false
  }

  return (
    isString(value.id) &&
    isString(value.source) &&
    isString(value.target) &&
    isOneOf(edgeTypes, value.type) &&
    isOptionalString(value.startDate) &&
    isOptionalString(value.endDate) &&
    typeof value.current === 'boolean' &&
    (value.confidence === 'verified' || value.confidence === 'inferred') &&
    isOptionalString(value.sourceUrl) &&
    isOptionalString(value.note)
  )
}

function isAccountGraph(value: unknown): value is AccountGraph {
  if (!isRecord(value) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    return false
  }

  return value.nodes.every(isGraphNode) && value.edges.every(isGraphEdge)
}

export function loadGraph(
  storage: StorageLike,
  fallbackGraph: AccountGraph = seedGraph,
): AccountGraph {
  const stored = storage.getItem(ACCOUNT_GRAPH_STORAGE_KEY)

  if (stored === null) {
    return fallbackGraph
  }

  try {
    const parsed: unknown = JSON.parse(stored)
    return isAccountGraph(parsed) ? parsed : fallbackGraph
  } catch {
    return fallbackGraph
  }
}

export function saveGraph(storage: StorageLike, graph: AccountGraph): void {
  storage.setItem(ACCOUNT_GRAPH_STORAGE_KEY, serializeGraph(graph))
}

export function clearStoredGraph(storage: StorageLike): void {
  storage.removeItem(ACCOUNT_GRAPH_STORAGE_KEY)
}

export function serializeGraph(graph: AccountGraph): string {
  return JSON.stringify(graph, null, 2)
}
