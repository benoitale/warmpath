import { describe, expect, it } from 'vitest'
import { seedGraph } from '../data/graph'
import type { StorageLike } from './storage'
import {
  ACCOUNT_GRAPH_STORAGE_KEY,
  clearStoredGraph,
  loadGraph,
  saveGraph,
  serializeGraph,
} from './storage'

function createStorage(): StorageLike {
  const values = new Map<string, string>()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

describe('AccountPath storage', () => {
  it('saves and loads a graph', () => {
    const storage = createStorage()

    saveGraph(storage, seedGraph)

    expect(loadGraph(storage)).toEqual(seedGraph)
  })

  it('falls back to the seed graph when storage is empty', () => {
    const storage = createStorage()

    expect(loadGraph(storage)).toBe(seedGraph)
  })

  it('falls back to the passed graph when stored JSON is corrupt', () => {
    const storage = createStorage()
    const fallbackGraph = { nodes: [], edges: [] }
    storage.setItem(ACCOUNT_GRAPH_STORAGE_KEY, '{not valid JSON')

    expect(loadGraph(storage, fallbackGraph)).toBe(fallbackGraph)
  })

  it('falls back when stored JSON has an invalid shape', () => {
    const storage = createStorage()
    const fallbackGraph = { nodes: [], edges: [] }
    storage.setItem(ACCOUNT_GRAPH_STORAGE_KEY, JSON.stringify({ nodes: null, edges: [] }))

    expect(loadGraph(storage, fallbackGraph)).toBe(fallbackGraph)
  })

  it('clears the stored graph', () => {
    const storage = createStorage()
    saveGraph(storage, seedGraph)

    clearStoredGraph(storage)

    expect(storage.getItem(ACCOUNT_GRAPH_STORAGE_KEY)).toBeNull()
  })

  it('serializes a graph as formatted JSON', () => {
    expect(serializeGraph(seedGraph)).toBe('{\n  "nodes": [],\n  "edges": []\n}')
  })
})
