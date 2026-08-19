import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AccountDetailPage } from './components/AccountDetailPage'
import { AccountPathLayout } from './components/AccountPathLayout'
import { AccountsPage } from './components/AccountsPage'
import { EditorPage } from './components/EditorPage'
import { GraphPage } from './components/GraphPage'
import { seedGraph } from './data/graph'
import { clearStoredGraph, loadGraph, saveGraph } from './lib/storage'
import type { AccountGraph } from './types'

const ACCOUNT_PATH_NOW = new Date('2026-08-19T00:00:00Z')

function loadInitialGraph(): AccountGraph {
  return loadGraph(window.localStorage, seedGraph)
}

export function AccountPathApp() {
  const [graph, setGraph] = useState<AccountGraph>(loadInitialGraph)

  function updateGraph(nextGraph: AccountGraph): void {
    saveGraph(window.localStorage, nextGraph)
    setGraph(nextGraph)
  }

  function resetGraph(): void {
    clearStoredGraph(window.localStorage)
    setGraph(seedGraph)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AccountPathLayout />} path="/">
          <Route element={<AccountsPage graph={graph} now={ACCOUNT_PATH_NOW} />} index />
          <Route element={<AccountDetailPage graph={graph} now={ACCOUNT_PATH_NOW} />} path="account/:id" />
          <Route element={<GraphPage graph={graph} />} path="graph" />
          <Route
            element={<EditorPage graph={graph} onGraphChange={updateGraph} onReset={resetGraph} />}
            path="edit"
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
