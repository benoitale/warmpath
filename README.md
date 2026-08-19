# WarmPath

A static, single-page web app that maps warm introduction paths from a company's investors, board, and leadership team into its target enterprise accounts. Demo artifact: public data only, no backend, no runtime API calls.

See [AGENTS.md](./AGENTS.md) for setup commands, hard rules, and project structure.

## Quick start

```sh
npm install
npm run dev
```

## Checks

```sh
npm run typecheck && npm test && npm run validate:graph && npm run build
```

## AccountPath

AccountPath is the current app shell in this shared repository. It maps Cognition's public and explicitly
inferred relationships into target accounts, stores local edits in browser storage, and does not make
runtime network calls. Its routes are `/`, `/account/:id`, `/graph`, and `/edit`.

The AccountPath data model lives in `src/accountpath/types.ts`:

- `GraphNode` has an `id`, `type` (`person`, `firm`, or `company`), display name, optional segment and
  metadata, and target-account/customer flags.
- `GraphEdge` connects source and target node IDs, classifies the relationship, carries optional dates,
  current-state, confidence (`verified` or `inferred`), and optional source/note fields.
- `AccountGraph` contains `nodes` and `edges`.

The settled path engine uses these base edge weights:

| Edge type | Base weight |
| --- | ---: |
| `chairman_of`, `board_seat`, `founded` | 5 |
| `employed_at`, `customer_of`, `led_round` | 4 |
| `invested_in`, `partner_of`, `acquired` | 3 |
| `co_invested_with` | 2 |

The three multiplicative modifiers are `0.5` for a non-current edge, `0.6` for an inferred edge, and
`0.8` for an edge whose reference date is more than ten years old. For a path with `hops` edges:

```text
score = sum(modified weights) / hops^1.5
```

Paths are ranked by descending score, then by the most recent edge date, then by fewer hops. The app
passes one fixed `now` value from `src/accountpath/AccountPathApp.tsx`; traversal and scoring do not
read the system clock.

To re-point the app at another company, replace `src/accountpath/data/graph.ts` while keeping the
`seedGraph` and `HOME_COMPANY_ID` exports. The AccountPath-specific path helpers live at
`src/accountpath/lib/paths.ts` rather than the spec's `src/lib/paths.ts` because AccountPath shares this
repository with the earlier WarmPath app.

### Inferred seed edges

The following list is generated from `seedGraph.edges` by filtering `confidence === "inferred"` and
grouping edge IDs by their `note` text. It was generated programmatically so it stays tied to the
authoritative seed data:

#### Stated in the seed brief; no public source URL attached, so left inferred.

Edges (50): e-scott-wu-cognition, e-scott-wu-cognition-emp, e-steven-hao-cognition, e-steven-hao-cognition-emp, e-walden-yan-cognition, e-walden-yan-cognition-emp, e-walden-yan-anysphere, e-theodor-marcu-retool, e-takumi-masai-ibm, e-takumi-masai-microsoft, e-takumi-masai-workday, e-takumi-masai-pivotal, e-emily-cohen-cognition, e-khosla-cognition, e-conviction-cognition, e-neo-cognition, e-pear-cognition, e-lonsdale-8vc, e-lonsdale-palantir, e-lonsdale-addepar, e-wolfe-lux, e-hebert-lux, e-hebert-lehman, e-malka-ribbit, e-malka-robinhood, e-malka-mercadolibre, e-nubank-cognition, e-mercadolibre-cognition, e-mizuho-cognition, e-ocbc-cognition, e-ramp-cognition, e-palantir-cognition, e-cisco-cognition, e-ltm-cognition, e-8vc-ramp, e-khosla-ramp, e-gc-ramp, e-conversion-ramp, e-neo-kalshi, e-conversion-blend, e-conversion-figure, e-conversion-temporal, e-ribbit-nubank, e-ribbit-robinhood, e-ribbit-coinbase, e-ribbit-figure, e-ribbit-affirm, e-ribbit-credit-karma, e-ribbit-revolut, e-ribbit-brex

#### Software engineer. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-scott-wu-addepar

#### CTO. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-scott-wu-lunchclub

#### Core engineer. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-steven-hao-scale

#### President. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-russell-kaplan-cognition

#### Led ML and ML infra. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-russell-kaplan-scale

#### Autopilot. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-russell-kaplan-tesla

#### Leads the Windsurf / Devin Desktop division. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-jeff-wang-cognition

#### Interim CEO. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-jeff-wang-windsurf

#### Head of Product Growth. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-theodor-marcu-cognition

#### President and GM Japan. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-takumi-masai-cognition

#### President, Datadog Japan. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-takumi-masai-datadog

#### VP and GM APAC, Singapore. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-richard-spence-cognition

#### Managing Director, sales and trading. Brief cites conversioncapital.com/people, which blocks non-browser clients, so prior sell-side roles are left inferred.

Edges (1): e-christian-lawless-lehman

#### Managing Director, sales and trading. Left inferred for the same reason as the Lehman Brothers edge.

Edges (2): e-christian-lawless-nomura, e-christian-lawless-barclays

#### Partner. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-emily-cohen-neo

#### $21M seed. Round detail per the seed brief. The Series D post confirms the investor relationship but does not document this round.

Edges (1): e-ff-cognition-seed

#### $175M Series A at $2B. Round detail per the seed brief. The Series D post confirms the investor relationship but does not document this round.

Edges (1): e-ff-cognition-a

#### $400M+ Series C at $10.2B. Round detail per the seed brief. The Series D post confirms the investor relationship but does not document this round.

Edges (1): e-ff-cognition-c

#### Series B at $4B. Round detail per the seed brief. The Series D post confirms the investor relationship but does not document this round.

Edges (1): e-8vc-cognition-b

#### Series B. Round detail per the seed brief. The Series D post confirms the investor relationship but does not document this round.

Edges (1): e-lux-cognition-b

#### Partner emeritus. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-singerman-ff

#### Board association asserted in the seed brief and explicitly flagged there as inferred.

Edges (1): e-singerman-cognition

#### Series B. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-ff-ramp

#### Series F. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-ms-kalshi

#### $200M at $3.1B. Stated in the seed brief; no public source URL attached, so left inferred.

Edges (1): e-gc-bilt-2024

#### General Catalyst co-bid for Janus Henderson with Trian in Mar 2026. Flagged inferred in the seed brief.

Edges (1): e-gc-janus
