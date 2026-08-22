import type { Edge, EdgeType, Node } from '../../src/schema/graph'

/**
 * Collector contracts.
 *
 * Hard rules (see AGENTS.md):
 * - Collectors run offline / at build time only. The Vite app never calls these.
 * - Every emitted edge must include a real public `source_url` and `source_accessed`.
 * - Never invent relationships. If a parser is unsure, drop the candidate.
 * - No personal contact details (email, phone, home address).
 * - No LinkedIn scraping.
 */

/** Stable id for a collector implementation (also used in edge id prefixes). */
export type CollectorId = 'edgar' | 'wikidata' | 'curated'

/** A company the collector is asked to enrich. */
export type CollectTarget = {
  /** Graph company id, e.g. `company:apollo-global`. */
  companyId: `company:${string}`
  /** Display name used for matching. */
  name: string
  /** Optional ticker for EDGAR resolution. */
  ticker?: string
  /** Optional SEC CIK (no leading zeros required; collectors normalize). */
  cik?: string
  /** Optional Wikidata QID, e.g. `Q285329`. */
  wikidataId?: string
}

/**
 * One sourced relationship claim produced by a collector, before merge/validation.
 * `from` / `to` are graph node ids the collector believes should exist.
 */
export type CollectedEdge = Omit<Edge, 'id'> & {
  /** Suggested edge id; merge may prefix on collision. */
  id: string
  collector: CollectorId
}

export type CollectedNode = Node & {
  collector: CollectorId
}

/** Partial graph fragment from one collector run. */
export type GraphFragment = {
  collector: CollectorId
  nodes: CollectedNode[]
  edges: CollectedEdge[]
  /** Human-readable notes: skipped candidates, weak matches, fetch errors. */
  dropped: string[]
}

export type CollectorContext = {
  /** Deterministic "today" for `source_accessed` (YYYY-MM-DD). */
  accessedOn: string
  /** Optional override: read fixtures instead of the network. */
  readFixture?: (name: string) => string
}

/**
 * A collector turns public documents into graph fragments.
 * `collect` must be pure w.r.t. system clock when `accessedOn` is provided
 * and must not require network when fixtures are supplied via context.
 */
export type Collector = {
  id: CollectorId
  collect: (targets: CollectTarget[], ctx: CollectorContext) => GraphFragment
}

export type MergeOptions = {
  /** ISO timestamp for `generated_at`. */
  generatedAt: string
  version?: string
}

export type EdgeTypeWeight = Record<EdgeType, number>
