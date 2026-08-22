import type { Collector, CollectTarget, GraphFragment } from '../types'
import { parseCohnGoldmanEmployment, parseDef14aRoles, slugifyPersonName } from './parseDef14a'
import { findLatestFiling, type EdgarSubmissions } from './parseSubmissions'

/**
 * EDGAR collector: resolves DEF 14A filings and emits board/exec edges.
 * Network fetch is optional; tests inject fixtures via `ctx.readFixture`.
 */
export const edgarCollector: Collector = {
  id: 'edgar',
  collect(targets: CollectTarget[], ctx): GraphFragment {
    const nodes: GraphFragment['nodes'] = []
    const edges: GraphFragment['edges'] = []
    const dropped: string[] = []

    for (const target of targets) {
      if (!target.cik && !target.ticker) {
        dropped.push(`${target.companyId}: no CIK/ticker; skipped`)
        continue
      }

      const submissions = loadSubmissions(target, ctx, dropped)
      if (!submissions) continue

      const filing = findLatestFiling(submissions, ['DEF 14A'])
      if (!filing) {
        dropped.push(`${target.companyId}: no DEF 14A in submissions sample`)
        continue
      }

      const html = loadDef14aHtml(target, filing.primaryDocument, ctx, dropped)
      if (!html) continue

      const roles = parseDef14aRoles(html)
      if (roles.length === 0) {
        dropped.push(`${target.companyId}: DEF 14A parser found no high-confidence roles`)
      }

      for (const hit of roles) {
        const personId = `person:${slugifyPersonName(hit.name)}` as `person:${string}`
        nodes.push({
          collector: 'edgar',
          id: personId,
          type: 'person',
          name: hit.name,
          aliases: [],
          public_role: `${labelRole(hit.role)}, ${target.name}`,
          current_org_id: hit.role === 'cio' && target.companyId !== 'company:sei-investments' ? target.companyId : target.companyId,
          is_connector: false,
          intro_budget_quarterly: 0,
          intros_used_this_quarter: 0,
        })

        const edgeType = hit.role === 'lead_independent_director' || hit.role === 'director' || hit.role === 'chair' ? 'board_seat' : 'exec_employment'
        edges.push({
          collector: 'edgar',
          id: `edge:edgar-${slugifyPersonName(hit.name)}-${target.companyId.replace('company:', '')}-${hit.role}`,
          from: personId,
          to: target.companyId,
          type: edgeType,
          start_date: null,
          end_date: null,
          source_url: filing.documentUrl,
          source_accessed: ctx.accessedOn,
          confidence: 'medium',
          notes: `Parsed from ${filing.form} (${filing.filingDate}): ${hit.evidence}`,
        })
      }

      if (target.companyId === 'company:apollo-global') {
        const employment = parseCohnGoldmanEmployment(html)
        if (employment) {
          nodes.push({
            collector: 'edgar',
            id: 'person:gary-cohn',
            type: 'person',
            name: 'Gary Cohn',
            aliases: [],
            public_role: 'Lead Independent Director, Apollo; former President & COO, Goldman Sachs',
            current_org_id: 'company:apollo-global',
            is_connector: false,
            intro_budget_quarterly: 0,
            intros_used_this_quarter: 0,
          })
          nodes.push({
            collector: 'edgar',
            id: 'company:goldman-sachs',
            type: 'company',
            name: 'Goldman Sachs',
            aliases: [employment.companyName],
            is_target: false,
            is_customer: true,
            tier: 1,
            industry: 'Investment banking',
            employee_band: '10000+',
          })
          edges.push({
            collector: 'edgar',
            id: 'edge:edgar-cohn-goldman-exec',
            from: 'person:gary-cohn',
            to: 'company:goldman-sachs',
            type: 'exec_employment',
            start_date: `${employment.startYear}-01`,
            end_date: `${employment.endYear}-12`,
            source_url: filing.documentUrl,
            source_accessed: ctx.accessedOn,
            confidence: 'high',
            notes: employment.evidence,
          })
        } else {
          dropped.push('apollo: Cohn→Goldman employment phrase not found in provided HTML')
        }
      }
    }

    return { collector: 'edgar', nodes, edges, dropped }
  },
}

function labelRole(role: string): string {
  switch (role) {
    case 'ceo':
      return 'Chief Executive Officer'
    case 'president':
      return 'President'
    case 'chair':
      return 'Chair'
    case 'lead_independent_director':
      return 'Lead Independent Director'
    case 'cio':
      return 'Chief Information Officer'
    default:
      return 'Executive'
  }
}

function loadSubmissions(
  target: CollectTarget,
  ctx: { readFixture?: (name: string) => string },
  dropped: string[],
): EdgarSubmissions | null {
  const fixtureName = fixtureKey(target, 'submissions')
  if (ctx.readFixture) {
    try {
      return JSON.parse(ctx.readFixture(fixtureName)) as EdgarSubmissions
    } catch {
      dropped.push(`${target.companyId}: missing submissions fixture ${fixtureName}`)
      return null
    }
  }
  dropped.push(`${target.companyId}: live EDGAR fetch not enabled in this build (use fixtures or curated graph)`)
  return null
}

function loadDef14aHtml(
  target: CollectTarget,
  _primaryDocument: string,
  ctx: { readFixture?: (name: string) => string },
  dropped: string[],
): string | null {
  void _primaryDocument
  const fixtureName = fixtureKey(target, 'def14a')
  if (ctx.readFixture) {
    try {
      return ctx.readFixture(fixtureName)
    } catch {
      dropped.push(`${target.companyId}: missing DEF 14A fixture ${fixtureName}`)
      return null
    }
  }
  dropped.push(`${target.companyId}: live DEF 14A fetch not enabled in this build`)
  return null
}

function fixtureKey(target: CollectTarget, kind: 'submissions' | 'def14a'): string {
  const slug = target.companyId.replace('company:', '')
  if (kind === 'submissions') return `edgar/${slug}-submissions.sample.json`
  return `edgar/${slug}-def14a.snippet.html`
}
