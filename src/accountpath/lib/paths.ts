import type { AccountGraph, EdgeType, GraphEdge, GraphNode } from '../types'

/** Base weight per relationship type, before modifiers. */
export const EDGE_WEIGHTS: Record<EdgeType, number> = {
  chairman_of: 5,
  board_seat: 5,
  founded: 5,
  employed_at: 4,
  customer_of: 4,
  led_round: 4,
  invested_in: 3,
  partner_of: 3,
  co_invested_with: 2,
  acquired: 3,
}

export const NOT_CURRENT_MODIFIER = 0.5
export const INFERRED_MODIFIER = 0.6
export const STALE_MODIFIER = 0.8
export const STALE_AFTER_YEARS = 10

export const DEFAULT_MAX_HOPS = 4

export type PathStep = {
  edge: GraphEdge
  /** Node the step starts from. */
  from: GraphNode
  /** Node the step arrives at. */
  to: GraphNode
}

export type Path = {
  steps: PathStep[]
  nodes: GraphNode[]
  hops: number
  score: number
  /** Most recent dated edge on the path, used as the tie-break. Null when undated. */
  latestEdgeDate: string | null
  /** True when every edge on the path is verified. */
  allVerified: boolean
}

export type FindPathsOptions = {
  /** Reference date for the staleness modifier. Passed in so scoring is deterministic. */
  now: Date
  maxHops?: number
  /** When true, paths containing an inferred edge are excluded. */
  verifiedOnly?: boolean
}

/** Parses "YYYY", "YYYY-MM" and full ISO dates into a timestamp. Null when unparseable. */
export function parseEdgeDate(value: string | undefined): number | null {
  if (value === undefined) return null
  const trimmed = value.trim()
  if (/^\d{4}$/.test(trimmed)) return Date.parse(`${trimmed}-01-01T00:00:00Z`)
  if (/^\d{4}-\d{2}$/.test(trimmed)) return Date.parse(`${trimmed}-01T00:00:00Z`)
  const parsed = Date.parse(trimmed)
  return Number.isNaN(parsed) ? null : parsed
}

/** The date an edge is anchored on: its end date when ended, otherwise its start date. */
function edgeReferenceDate(edge: GraphEdge): number | null {
  return parseEdgeDate(edge.endDate) ?? parseEdgeDate(edge.startDate)
}

export function scoreEdge(edge: GraphEdge, now: Date): number {
  let weight = EDGE_WEIGHTS[edge.type]
  if (!edge.current) weight *= NOT_CURRENT_MODIFIER
  if (edge.confidence === 'inferred') weight *= INFERRED_MODIFIER

  const reference = edgeReferenceDate(edge)
  if (reference !== null) {
    const ageYears = (now.getTime() - reference) / (365.25 * 24 * 60 * 60 * 1000)
    if (ageYears > STALE_AFTER_YEARS) weight *= STALE_MODIFIER
  }
  return weight
}

export function scorePath(steps: PathStep[], now: Date): number {
  if (steps.length === 0) return 0
  const total = steps.reduce((sum, step) => sum + scoreEdge(step.edge, now), 0)
  return total / Math.pow(steps.length, 1.5)
}

function latestDateOf(steps: PathStep[]): string | null {
  let bestValue: string | null = null
  let bestTime = Number.NEGATIVE_INFINITY
  for (const step of steps) {
    const raw = step.edge.endDate ?? step.edge.startDate
    const time = edgeReferenceDate(step.edge)
    if (raw !== undefined && time !== null && time > bestTime) {
      bestTime = time
      bestValue = raw
    }
  }
  return bestValue
}

type Adjacency = Map<string, { edge: GraphEdge; otherId: string }[]>

/** Edges are traversed in both directions: a relationship is warm either way. */
function buildAdjacency(edges: GraphEdge[]): Adjacency {
  const adjacency: Adjacency = new Map()
  const push = (from: string, otherId: string, edge: GraphEdge): void => {
    const list = adjacency.get(from)
    if (list === undefined) {
      adjacency.set(from, [{ edge, otherId }])
    } else {
      list.push({ edge, otherId })
    }
  }
  for (const edge of edges) {
    push(edge.source, edge.target, edge)
    push(edge.target, edge.source, edge)
  }
  return adjacency
}

/**
 * All simple paths between two nodes, up to `maxHops` edges, ranked by score
 * descending and tie-broken on the most recent edge date.
 */
export function findPaths(
  graph: AccountGraph,
  fromId: string,
  toId: string,
  opts: FindPathsOptions,
): Path[] {
  const maxHops = opts.maxHops ?? DEFAULT_MAX_HOPS
  const nodesById = new Map<string, GraphNode>(graph.nodes.map((node) => [node.id, node]))
  const start = nodesById.get(fromId)
  const end = nodesById.get(toId)
  if (start === undefined || end === undefined || fromId === toId || maxHops < 1) return []

  const adjacency = buildAdjacency(graph.edges)
  const found: Path[] = []
  const visited = new Set<string>([fromId])
  const steps: PathStep[] = []

  const walk = (currentId: string): void => {
    if (steps.length >= maxHops) return
    for (const { edge, otherId } of adjacency.get(currentId) ?? []) {
      if (visited.has(otherId)) continue
      const fromNode = nodesById.get(currentId)
      const toNode = nodesById.get(otherId)
      if (fromNode === undefined || toNode === undefined) continue
      if (opts.verifiedOnly === true && edge.confidence !== 'verified') continue

      steps.push({ edge, from: fromNode, to: toNode })
      if (otherId === toId) {
        const pathSteps = [...steps]
        found.push({
          steps: pathSteps,
          nodes: [start, ...pathSteps.map((step) => step.to)],
          hops: pathSteps.length,
          score: scorePath(pathSteps, opts.now),
          latestEdgeDate: latestDateOf(pathSteps),
          allVerified: pathSteps.every((step) => step.edge.confidence === 'verified'),
        })
      } else {
        visited.add(otherId)
        walk(otherId)
        visited.delete(otherId)
      }
      steps.pop()
    }
  }

  walk(fromId)

  return found.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const aDate = parseEdgeDate(a.latestEdgeDate ?? undefined) ?? Number.NEGATIVE_INFINITY
    const bDate = parseEdgeDate(b.latestEdgeDate ?? undefined) ?? Number.NEGATIVE_INFINITY
    if (bDate !== aDate) return bDate - aDate
    return a.hops - b.hops
  })
}

export type AccountStatus = 'customer' | 'warm-path' | 'cold'

export type AccountSummary = {
  account: GraphNode
  status: AccountStatus
  bestPath: Path | null
  paths: Path[]
  /** Person on the best path, when the path routes through one. */
  connector: GraphNode | null
}

/** The human on a path: the first person node between the endpoints. */
export function connectorOf(path: Path): GraphNode | null {
  const middle = path.nodes.slice(1, -1)
  return middle.find((node) => node.type === 'person') ?? middle[0] ?? null
}

export function summarizeAccount(
  graph: AccountGraph,
  homeId: string,
  accountId: string,
  opts: FindPathsOptions,
): AccountSummary | null {
  const account = graph.nodes.find((node) => node.id === accountId)
  if (account === undefined) return null

  const paths = findPaths(graph, homeId, accountId, opts)
  const bestPath = paths[0] ?? null
  const status: AccountStatus =
    account.isExistingCustomer === true ? 'customer' : bestPath === null ? 'cold' : 'warm-path'

  return {
    account,
    status,
    bestPath,
    paths,
    connector: bestPath === null ? null : connectorOf(bestPath),
  }
}
