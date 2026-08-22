import type { Collector, CollectTarget, GraphFragment } from '../types'
import { boardMembersQuery, parseWikidataBoardMembers, type WikidataSparqlResponse } from './parseBoardMembers'
import { slugifyPersonName } from '../edgar/parseDef14a'

/**
 * Wikidata collector: board members via P3320.
 * Live SPARQL is optional; tests inject fixture JSON via `ctx.readFixture`.
 */
export const wikidataCollector: Collector = {
  id: 'wikidata',
  collect(targets: CollectTarget[], ctx): GraphFragment {
    const nodes: GraphFragment['nodes'] = []
    const edges: GraphFragment['edges'] = []
    const dropped: string[] = []

    for (const target of targets) {
      if (!target.wikidataId) {
        dropped.push(`${target.companyId}: no wikidataId; skipped`)
        continue
      }

      // Validate QID / query shape even when using fixtures.
      try {
        boardMembersQuery(target.wikidataId)
      } catch (error) {
        dropped.push(`${target.companyId}: ${error instanceof Error ? error.message : String(error)}`)
        continue
      }

      const response = loadSparql(target, ctx, dropped)
      if (!response) continue

      const members = parseWikidataBoardMembers(response)
      if (members.length === 0) {
        dropped.push(`${target.companyId}: Wikidata returned no board members`)
      }

      for (const member of members) {
        const personId = `person:${slugifyPersonName(member.name)}` as `person:${string}`
        nodes.push({
          collector: 'wikidata',
          id: personId,
          type: 'person',
          name: member.name,
          aliases: [member.qid],
          public_role: `Board member, ${target.name}`,
          current_org_id: target.companyId,
          is_connector: false,
          intro_budget_quarterly: 0,
          intros_used_this_quarter: 0,
        })
        edges.push({
          collector: 'wikidata',
          id: `edge:wikidata-${member.qid}-${target.companyId.replace('company:', '')}-board`,
          from: personId,
          to: target.companyId,
          type: 'board_seat',
          start_date: member.startDate,
          end_date: member.endDate,
          source_url: `https://www.wikidata.org/wiki/${member.qid}`,
          source_accessed: ctx.accessedOn,
          confidence: 'medium',
          notes: `Wikidata P3320 board member of ${target.wikidataId} (${target.name}).`,
        })
      }
    }

    return { collector: 'wikidata', nodes, edges, dropped }
  },
}

function loadSparql(
  target: CollectTarget,
  ctx: { readFixture?: (name: string) => string },
  dropped: string[],
): WikidataSparqlResponse | null {
  const name = `wikidata/${target.companyId.replace('company:', '')}-board.sparql.json`
  if (ctx.readFixture) {
    try {
      return JSON.parse(ctx.readFixture(name)) as WikidataSparqlResponse
    } catch {
      dropped.push(`${target.companyId}: missing Wikidata fixture ${name}`)
      return null
    }
  }
  dropped.push(`${target.companyId}: live Wikidata fetch not enabled in this build`)
  return null
}
