import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { GraphSchema, type Graph } from '../src/schema/graph'

export function collectFailures(graph: Graph): string[] {
  const failures: string[] = []

  const nodeIds = new Set<string>(graph.nodes.map((node) => node.id))
  const seenNodeIds = new Set<string>()
  for (const node of graph.nodes) {
    if (seenNodeIds.has(node.id)) {
      failures.push(`duplicate node id: "${node.id}"`)
    }
    seenNodeIds.add(node.id)
  }

  const seenEdgeIds = new Set<string>()
  for (const edge of graph.edges) {
    if (seenEdgeIds.has(edge.id)) {
      failures.push(`edge "${edge.id}": duplicate edge id`)
    }
    seenEdgeIds.add(edge.id)

    if (!nodeIds.has(edge.from)) {
      failures.push(`edge "${edge.id}": from references unknown node id "${edge.from}"`)
    }
    if (!nodeIds.has(edge.to)) {
      failures.push(`edge "${edge.id}": to references unknown node id "${edge.to}"`)
    }

    if (edge.start_date !== null && edge.end_date !== null && edge.end_date < edge.start_date) {
      failures.push(
        `edge "${edge.id}": end_date "${edge.end_date}" is earlier than start_date "${edge.start_date}"`,
      )
    }
  }

  return failures
}

export function validateGraphFile(filePath: string): string[] {
  let raw: string
  try {
    raw = readFileSync(filePath, 'utf-8')
  } catch (error) {
    return [`could not read ${filePath}: ${error instanceof Error ? error.message : String(error)}`]
  }

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (error) {
    return [`${filePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`]
  }

  const parsed = GraphSchema.safeParse(data)
  if (!parsed.success) {
    return parsed.error.issues.map(
      (issue) => `schema violation at ${issue.path.join('.') || '<root>'}: ${issue.message}`,
    )
  }

  return collectFailures(parsed.data)
}

function main(): void {
  const targets = process.argv.slice(2)
  const files = targets.length > 0 ? targets : ['data/graph.json', 'data/graph.fixture.json']

  let failed = false
  for (const file of files) {
    const filePath = resolve(process.cwd(), file)
    const failures = validateGraphFile(filePath)
    if (failures.length === 0) {
      console.log(`OK  ${file}`)
    } else {
      failed = true
      console.error(`FAIL ${file} (${failures.length} problem${failures.length === 1 ? '' : 's'}):`)
      for (const failure of failures) {
        console.error(`  - ${failure}`)
      }
    }
  }

  if (failed) {
    process.exit(1)
  }
}

if (process.argv[1] && process.argv[1].endsWith('validate-graph.ts')) {
  main()
}
