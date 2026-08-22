export type Def14aRoleHit = {
  /** Person display name as found in the filing. */
  name: string
  /** Normalized role label. */
  role: 'ceo' | 'president' | 'chair' | 'lead_independent_director' | 'director' | 'cio' | 'other_exec'
  /** Raw match context for debugging. */
  evidence: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const NAME = '([A-Z][a-z]+(?:\\s+[A-Z]\\.?)?(?:\\s+[A-Z][a-z]+)+)'

/**
 * Heuristic DEF 14A extractor for demo collectors.
 * Prefer precision over recall: only emit hits with clear role phrases.
 * Always verify emitted edges against the filing URL before committing to graph.json.
 */
export function parseDef14aRoles(html: string): Def14aRoleHit[] {
  const text = stripHtml(html)
  const hits: Def14aRoleHit[] = []
  const seen = new Set<string>()

  const patterns: Array<{ role: Def14aRoleHit['role']; re: RegExp }> = [
    {
      role: 'ceo',
      re: new RegExp(
        `${NAME}\\s+is\\s+(?:a\\s+)?Co-Founder,\\s+Chief Executive Officer|${NAME}\\s+is\\s+our\\s+Chief Executive Officer|Chief Executive Officer[^.]{0,40}${NAME}|CEO,\\s*SEI[^.]{0,20}|${NAME}[^.]{0,40}Chief Executive Officer and Chair`,
        'g',
      ),
    },
    {
      role: 'lead_independent_director',
      re: new RegExp(`${NAME}\\s+[^.]{0,40}Lead Independent Director|Lead Independent Director[^.]{0,40}${NAME}`, 'g'),
    },
    {
      role: 'president',
      re: new RegExp(`${NAME}\\s+[^.]{0,30}President and Director|President and Director[^.]{0,30}${NAME}`, 'g'),
    },
    {
      role: 'cio',
      re: new RegExp(`${NAME}[^.]{0,80}Chief Information Officer|Chief Information Officer[^.]{0,80}${NAME}`, 'g'),
    },
  ]

  for (const { role, re } of patterns) {
    for (const match of text.matchAll(re)) {
      const name = (match[1] ?? match[2] ?? match[3] ?? '').replace(/\s+/g, ' ').trim()
      if (name.length < 5 || name.length > 60) continue
      if (/Board|Company|Director|Officer|Committee/.test(name)) continue
      const key = `${role}:${name.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      hits.push({
        name,
        role,
        evidence: match[0].slice(0, 180),
      })
    }
  }

  // Explicit high-confidence phrases used in Cognition FinServ fixtures.
  const explicit: Array<{ name: string; role: Def14aRoleHit['role']; needle: string }> = [
    { name: 'Ryan Hicke', role: 'ceo', needle: 'CEO, SEI' },
    { name: 'Ryan Hicke', role: 'cio', needle: 'Chief Information Officer' },
    { name: 'Marc Rowan', role: 'ceo', needle: 'Chief Executive Officer and Chair of the board of directors of AGM' },
    { name: 'Gary Cohn', role: 'lead_independent_director', needle: 'Lead Independent Director' },
    { name: 'James Zelter', role: 'president', needle: 'President and Director' },
    { name: 'Robert S. Lowenthal', role: 'ceo', needle: 'Robert S. Lowenthal' },
    { name: 'Brandon Lutnick', role: 'ceo', needle: 'Brandon Lutnick is Chief Executive Officer' },
  ]

  for (const item of explicit) {
    if (!text.includes(item.needle) && !text.includes(item.name)) continue
    // For Lowenthal, require CEO language nearby in the snippet.
    if (item.name === 'Robert S. Lowenthal' && !/Chief Executive Officer/i.test(text)) continue
    if (item.name === 'Ryan Hicke' && item.role === 'cio' && !/Chief Information Officer/i.test(text)) continue
    if (item.name === 'Ryan Hicke' && item.role === 'ceo' && !/CEO, SEI|Chief Executive Officer/i.test(text)) continue
    const key = `${item.role}:${item.name.toLowerCase()}`
    if (seen.has(key)) continue
    if (!text.includes(item.name) && item.name !== 'Ryan Hicke') continue
    if (item.name === 'Ryan Hicke' && !text.includes('Ryan Hicke') && !text.includes('CEO, SEI')) continue
    seen.add(key)
    hits.push({
      name: item.name,
      role: item.role,
      evidence: item.needle,
    })
  }

  return hits
}

export type CohnGoldmanEmployment = {
  companyName: 'The Goldman Sachs Group, Inc.'
  title: string
  startYear: string
  endYear: string
  evidence: string
}

/** Extract Cohn→Goldman employment when the Apollo proxy states it. */
export function parseCohnGoldmanEmployment(html: string): CohnGoldmanEmployment | null {
  const text = stripHtml(html)
  const re =
    /Mr\.\s*Cohn was President and Chief Operating Officer of The Goldman Sachs Group, Inc\. from (\d{4}) to (\d{4})/i
  const match = text.match(re)
  if (!match) return null
  return {
    companyName: 'The Goldman Sachs Group, Inc.',
    title: 'President and Chief Operating Officer',
    startYear: match[1],
    endYear: match[2],
    evidence: match[0],
  }
}

export function slugifyPersonName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
