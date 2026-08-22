export type WikidataSparqlBinding = {
  person?: { value: string }
  personLabel?: { value: string }
  start?: { value: string }
  end?: { value: string }
}

export type WikidataSparqlResponse = {
  results?: {
    bindings?: WikidataSparqlBinding[]
  }
}

export type WikidataBoardMember = {
  qid: string
  name: string
  startDate: string | null
  endDate: string | null
}

function qidFromUri(uri: string): string | null {
  const match = uri.match(/\/entity\/(Q\d+)$/)
  return match ? match[1] : null
}

function toYearMonth(value: string | undefined): string | null {
  if (!value) return null
  // Wikidata often returns xsd:dateTime like 2021-01-01T00:00:00Z
  const match = value.match(/^(\d{4})-(\d{2})/)
  if (!match) return null
  return `${match[1]}-${match[2]}`
}

/**
 * Parse a Wikidata SPARQL JSON response for company board members (P3320).
 * Pure: no I/O. Callers supply fixture or live response bodies.
 */
export function parseWikidataBoardMembers(response: WikidataSparqlResponse): WikidataBoardMember[] {
  const bindings = response.results?.bindings ?? []
  const members: WikidataBoardMember[] = []
  const seen = new Set<string>()

  for (const binding of bindings) {
    const uri = binding.person?.value
    const name = binding.personLabel?.value?.trim()
    if (!uri || !name) continue
    const qid = qidFromUri(uri)
    if (!qid) continue
    if (seen.has(qid)) continue
    seen.add(qid)
    members.push({
      qid,
      name,
      startDate: toYearMonth(binding.start?.value),
      endDate: toYearMonth(binding.end?.value),
    })
  }

  return members
}

/** SPARQL template for current board members of a company QID. */
export function boardMembersQuery(companyQid: string): string {
  if (!/^Q\d+$/.test(companyQid)) {
    throw new Error(`Invalid Wikidata QID: ${companyQid}`)
  }
  return `
SELECT ?person ?personLabel ?start ?end WHERE {
  wd:${companyQid} p:P3320 ?statement .
  ?statement ps:P3320 ?person .
  OPTIONAL { ?statement pq:P580 ?start . }
  OPTIONAL { ?statement pq:P582 ?end . }
  FILTER NOT EXISTS { ?statement pq:P582 ?endFilter . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
`.trim()
}
