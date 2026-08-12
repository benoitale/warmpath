import { useMemo, useState } from 'react'
import graphJson from '../data/graph.json'
import { GraphSchema, type Graph } from './schema'
import { scorePaths, type ScoredPath } from './scoring'
import { draftIntro } from './drafts/draftIntro'
import { AccountSearch } from './components/search/AccountSearch'
import { PathCard } from './components/path/PathCard'
import { GraphView } from './components/graph/GraphView'

type Tab = 'search' | 'graph'

export function App() {
  const graph: Graph = useMemo(() => GraphSchema.parse(graphJson), [])
  const [tab, setTab] = useState<Tab>('search')
  const [focusCompanyId, setFocusCompanyId] = useState<string | null>(null)

  const paths: ScoredPath[] = useMemo(
    () => (focusCompanyId ? scorePaths(graph, focusCompanyId, new Date()) : []),
    [graph, focusCompanyId],
  )
  void draftIntro

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">WarmPath</h1>
        <p className="text-sm text-gray-600">
          Warm introduction paths into target accounts, from public data.
        </p>
      </header>
      <nav className="mb-4 flex gap-2">
        <button
          type="button"
          className={`rounded px-3 py-1 text-sm ${tab === 'search' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
          onClick={() => setTab('search')}
        >
          Search
        </button>
        <button
          type="button"
          className={`rounded px-3 py-1 text-sm ${tab === 'graph' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
          onClick={() => setTab('graph')}
        >
          Graph
        </button>
      </nav>
      {tab === 'search' ? (
        <div className="space-y-4">
          <AccountSearch graph={graph} onSelectCompany={setFocusCompanyId} />
          {focusCompanyId !== null && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-gray-700">
                Connections around{' '}
                {graph.nodes.find((node) => node.id === focusCompanyId)?.name ?? focusCompanyId}
              </h2>
              <GraphView graph={graph} focusCompanyId={focusCompanyId} />
            </div>
          )}
          {paths.map((path) => (
            <PathCard key={path.steps.map((step) => step.edge.id).join('|')} path={path} graph={graph} />
          ))}
          <p className="text-sm text-gray-500">
            {graph.nodes.length} nodes, {graph.edges.length} edges loaded.
          </p>
        </div>
      ) : (
        <GraphView graph={graph} focusCompanyId={focusCompanyId} />
      )}
    </div>
  )
}

export default App
