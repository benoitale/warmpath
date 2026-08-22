import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { curatedCognitionFinservCollector } from './curated/cognitionFinserv'
import { mergeFragments } from './merge'

const here = dirname(fileURLToPath(import.meta.url))

/**
 * Build the committed demo graph from the curated Cognition × FinServ fragment.
 * EDGAR / Wikidata collectors are exercised in unit tests against fixtures;
 * they are not merged into graph.json until their outputs are hand-checked.
 */
function main(): void {
  const accessedOn = '2026-08-22'
  const curated = curatedCognitionFinservCollector.collect([], { accessedOn })
  const { graph, dropped } = mergeFragments([curated], {
    generatedAt: '2026-08-22T01:00:00Z',
    version: '0.2.0',
  })

  const outPath = resolve(here, '../../data/graph.json')
  writeFileSync(outPath, `${JSON.stringify(graph, null, 2)}\n`, 'utf-8')

  console.log(`Wrote ${outPath}`)
  console.log(`nodes=${graph.nodes.length} edges=${graph.edges.length}`)
  if (dropped.length > 0) {
    console.log('Dropped / notes:')
    for (const note of dropped) console.log(`  - ${note}`)
  }

  // Touch validate inputs stay readable in this environment.
  void readFileSync(outPath, 'utf-8')
}

main()
