# Collectors

Build-time only. The Vite app never calls these APIs.

## Hard rules

- Every edge needs a real `source_url` + `source_accessed`
- Never invent a relationship
- No LinkedIn, no personal contact details
- Prefer fixtures in tests; live fetch is optional for regeneration

## Interfaces (`types.ts`)

| Type | Role |
|---|---|
| `CollectTarget` | Company to enrich (`companyId`, ticker/CIK, Wikidata QID) |
| `Collector` | `collect(targets, ctx) → GraphFragment` |
| `GraphFragment` | `nodes`, `edges`, `dropped` notes |
| `CollectorContext` | `accessedOn` + optional `readFixture` |
| `mergeFragments` | First-writer-wins merge → Zod-validated `Graph` |

## Sources

### 1. EDGAR (`edgar/`)

**Input:** CIK / ticker → submissions JSON → DEF 14A HTML  
**Output:** person nodes + `board_seat` / `exec_employment` edges citing the filing URL  
**Key parsers:** `findLatestFiling`, `parseDef14aRoles`, `parseCohnGoldmanEmployment`  
**API:** `https://data.sec.gov/submissions/CIK##########.json` (no key; User-Agent required)

### 2. Wikidata (`wikidata/`)

**Input:** company QID  
**Output:** board members via P3320 → `board_seat` edges citing `wikidata.org/wiki/Q…`  
**Key parsers:** `boardMembersQuery`, `parseWikidataBoardMembers`  
**API:** `https://query.wikidata.org/sparql`

### 3. Curated (`curated/cognitionFinserv.ts`)

Hand-checked Cognition seller network + FinServ East targets (SEI, Apollo, Cantor, Oppenheimer), investors, named customers, and the **Goldman ↔ Gary Cohn ↔ Apollo** alumni bridge from Apollo’s DEF 14A.

## Commands

```sh
npm run collect:graph    # writes data/graph.json from curated fragment
npm test                 # parsers run against __fixtures__/
npm run validate:graph
```

## Deliberately dropped

See `dropped` on the curated fragment: no invented investor→target edges, no email enrichment, Cantor.com blocked so Cantor roles were taken from BGC’s DEF 14A.
