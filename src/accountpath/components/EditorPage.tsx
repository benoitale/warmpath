import { useState, type ReactNode } from 'react'
import { clearStoredGraph, serializeGraph } from '../lib/storage'
import { validateEdgeDraft, validateNodeDraft } from '../lib/validation'
import type { AccountGraph, EdgeType, GraphEdge, GraphNode, NodeType, Segment } from '../types'

type EditorPageProps = {
  graph: AccountGraph
  onGraphChange: (graph: AccountGraph) => void
  onReset: () => void
}

type NodeForm = {
  id: string
  type: NodeType
  name: string
  segment: Segment | ''
  role: string
  hq: string
  isTargetAccount: boolean
  isExistingCustomer: boolean
  notes: string
}

type EdgeForm = {
  id: string
  source: string
  target: string
  type: EdgeType
  startDate: string
  endDate: string
  current: boolean
  confidence: 'verified' | 'inferred'
  sourceUrl: string
  note: string
}

const nodeTypes: NodeType[] = ['person', 'firm', 'company']
const segments: Segment[] = [
  'money-center-bank',
  'asset-management',
  'trading',
  'market-infrastructure',
  'insurance',
  'fintech',
  'crypto',
  'vendor',
  'investor',
  'internal',
]
const edgeTypes: EdgeType[] = [
  'founded',
  'employed_at',
  'board_seat',
  'chairman_of',
  'invested_in',
  'led_round',
  'co_invested_with',
  'customer_of',
  'partner_of',
  'acquired',
]

const emptyNodeForm: NodeForm = {
  id: '',
  type: 'company',
  name: '',
  segment: '',
  role: '',
  hq: '',
  isTargetAccount: false,
  isExistingCustomer: false,
  notes: '',
}

const emptyEdgeForm: EdgeForm = {
  id: '',
  source: '',
  target: '',
  type: 'partner_of',
  startDate: '',
  endDate: '',
  current: true,
  confidence: 'verified',
  sourceUrl: '',
  note: '',
}

function nodeToForm(node: GraphNode): NodeForm {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    segment: node.segment ?? '',
    role: node.role ?? '',
    hq: node.hq ?? '',
    isTargetAccount: node.isTargetAccount ?? false,
    isExistingCustomer: node.isExistingCustomer ?? false,
    notes: node.notes ?? '',
  }
}

function edgeToForm(edge: GraphEdge): EdgeForm {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
    startDate: edge.startDate ?? '',
    endDate: edge.endDate ?? '',
    current: edge.current,
    confidence: edge.confidence,
    sourceUrl: edge.sourceUrl ?? '',
    note: edge.note ?? '',
  }
}

function formToNode(form: NodeForm): GraphNode {
  return {
    id: form.id.trim(),
    type: form.type,
    name: form.name.trim(),
    ...(form.segment === '' ? {} : { segment: form.segment }),
    ...(form.role.trim() === '' ? {} : { role: form.role.trim() }),
    ...(form.hq.trim() === '' ? {} : { hq: form.hq.trim() }),
    isTargetAccount: form.isTargetAccount,
    isExistingCustomer: form.isExistingCustomer,
    ...(form.notes.trim() === '' ? {} : { notes: form.notes.trim() }),
  }
}

function formToEdge(form: EdgeForm): GraphEdge {
  return {
    id: form.id.trim(),
    source: form.source,
    target: form.target,
    type: form.type,
    ...(form.startDate.trim() === '' ? {} : { startDate: form.startDate.trim() }),
    ...(form.endDate.trim() === '' ? {} : { endDate: form.endDate.trim() }),
    current: form.current,
    confidence: form.confidence,
    ...(form.sourceUrl.trim() === '' ? {} : { sourceUrl: form.sourceUrl.trim() }),
    ...(form.note.trim() === '' ? {} : { note: form.note.trim() }),
  }
}

function FieldLabel({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  )
}

function Errors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null
  return (
    <ul className="space-y-1 rounded-md bg-red-50 p-3 text-sm text-red-700">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  )
}

export function EditorPage({ graph, onGraphChange, onReset }: EditorPageProps) {
  const [nodeForm, setNodeForm] = useState<NodeForm>(emptyNodeForm)
  const [edgeForm, setEdgeForm] = useState<EdgeForm>(emptyEdgeForm)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null)
  const [nodeErrors, setNodeErrors] = useState<string[]>([])
  const [edgeErrors, setEdgeErrors] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  function saveNode(): void {
    const node = formToNode(nodeForm)
    const errors = validateNodeDraft(node, graph, editingNodeId ?? undefined)
    setNodeErrors(errors)
    setMessage(null)
    if (errors.length > 0) return

    const nodes =
      editingNodeId === null
        ? [...graph.nodes, node]
        : graph.nodes.map((candidate) => (candidate.id === editingNodeId ? node : candidate))
    onGraphChange({ ...graph, nodes })
    setNodeForm(emptyNodeForm)
    setEditingNodeId(null)
    setMessage('Node saved.')
  }

  function saveEdge(): void {
    const edge = formToEdge(edgeForm)
    const errors = validateEdgeDraft(edge, graph, editingEdgeId ?? undefined)
    setEdgeErrors(errors)
    setMessage(null)
    if (errors.length > 0) return

    const edges =
      editingEdgeId === null
        ? [...graph.edges, edge]
        : graph.edges.map((candidate) => (candidate.id === editingEdgeId ? edge : candidate))
    onGraphChange({ ...graph, edges })
    setEdgeForm(emptyEdgeForm)
    setEditingEdgeId(null)
    setMessage('Edge saved.')
  }

  function exportGraph(): void {
    const blob = new Blob([serializeGraph(graph)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'accountpath-graph.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function resetGraph(): void {
    clearStoredGraph(window.localStorage)
    onReset()
    setMessage('Reset to seed graph.')
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Editor</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Edit graph data</h1>
        <p className="mt-2 text-sm text-slate-600">
          Changes are saved locally in this browser. Verified edges require a public source URL.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          onClick={exportGraph}
          type="button"
        >
          Export JSON
        </button>
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={resetGraph}
          type="button"
        >
          Reset to seed
        </button>
        {message !== null && <p className="self-center text-sm text-emerald-700">{message}</p>}
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <form
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault()
            saveNode()
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{editingNodeId === null ? 'Add node' : 'Edit node'}</h2>
            {editingNodeId !== null && (
              <button
                className="text-sm text-slate-500 underline"
                onClick={() => {
                  setEditingNodeId(null)
                  setNodeForm(emptyNodeForm)
                  setNodeErrors([])
                }}
                type="button"
              >
                New node
              </button>
            )}
          </div>
          <Errors errors={nodeErrors} />
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="ID">
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
                onChange={(event) => setNodeForm({ ...nodeForm, id: event.target.value })}
                readOnly={editingNodeId !== null}
                required
                value={nodeForm.id}
              />
            </FieldLabel>
            <FieldLabel label="Type">
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
                onChange={(event) => setNodeForm({ ...nodeForm, type: event.target.value as NodeType })}
                value={nodeForm.type}
              >
                {nodeTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </FieldLabel>
          </div>
          <FieldLabel label="Name">
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              onChange={(event) => setNodeForm({ ...nodeForm, name: event.target.value })}
              required
              value={nodeForm.name}
            />
          </FieldLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="Segment">
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
                onChange={(event) => setNodeForm({ ...nodeForm, segment: event.target.value as Segment | '' })}
                value={nodeForm.segment}
              >
                <option value="">None</option>
                {segments.map((segment) => (
                  <option key={segment}>{segment}</option>
                ))}
              </select>
            </FieldLabel>
            <FieldLabel label="HQ">
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
                onChange={(event) => setNodeForm({ ...nodeForm, hq: event.target.value })}
                value={nodeForm.hq}
              />
            </FieldLabel>
          </div>
          <FieldLabel label="Role">
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              onChange={(event) => setNodeForm({ ...nodeForm, role: event.target.value })}
              value={nodeForm.role}
            />
          </FieldLabel>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input
                checked={nodeForm.isTargetAccount}
                onChange={(event) => setNodeForm({ ...nodeForm, isTargetAccount: event.target.checked })}
                type="checkbox"
              />
              Target account
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={nodeForm.isExistingCustomer}
                onChange={(event) => setNodeForm({ ...nodeForm, isExistingCustomer: event.target.checked })}
                type="checkbox"
              />
              Existing customer
            </label>
          </div>
          <FieldLabel label="Notes">
            <textarea
              className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              onChange={(event) => setNodeForm({ ...nodeForm, notes: event.target.value })}
              value={nodeForm.notes}
            />
          </FieldLabel>
          <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="submit">
            Save node
          </button>
        </form>

        <form
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault()
            saveEdge()
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{editingEdgeId === null ? 'Add edge' : 'Edit edge'}</h2>
            {editingEdgeId !== null && (
              <button
                className="text-sm text-slate-500 underline"
                onClick={() => {
                  setEditingEdgeId(null)
                  setEdgeForm(emptyEdgeForm)
                  setEdgeErrors([])
                }}
                type="button"
              >
                New edge
              </button>
            )}
          </div>
          <Errors errors={edgeErrors} />
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="ID">
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
                onChange={(event) => setEdgeForm({ ...edgeForm, id: event.target.value })}
                readOnly={editingEdgeId !== null}
                required
                value={edgeForm.id}
              />
            </FieldLabel>
            <FieldLabel label="Type">
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
                onChange={(event) => setEdgeForm({ ...edgeForm, type: event.target.value as EdgeType })}
                value={edgeForm.type}
              >
                {edgeTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </FieldLabel>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="Source">
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
                onChange={(event) => setEdgeForm({ ...edgeForm, source: event.target.value })}
                value={edgeForm.source}
              >
                <option value="">Select node</option>
                {graph.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.id})
                  </option>
                ))}
              </select>
            </FieldLabel>
            <FieldLabel label="Target">
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
                onChange={(event) => setEdgeForm({ ...edgeForm, target: event.target.value })}
                value={edgeForm.target}
              >
                <option value="">Select node</option>
                {graph.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.id})
                  </option>
                ))}
              </select>
            </FieldLabel>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="Start date">
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
                onChange={(event) => setEdgeForm({ ...edgeForm, startDate: event.target.value })}
                placeholder="YYYY-MM"
                value={edgeForm.startDate}
              />
            </FieldLabel>
            <FieldLabel label="End date">
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
                onChange={(event) => setEdgeForm({ ...edgeForm, endDate: event.target.value })}
                placeholder="YYYY-MM"
                value={edgeForm.endDate}
              />
            </FieldLabel>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input
                checked={edgeForm.current}
                onChange={(event) => setEdgeForm({ ...edgeForm, current: event.target.checked })}
                type="checkbox"
              />
              Current
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={edgeForm.confidence === 'verified'}
                onChange={(event) =>
                  setEdgeForm({
                    ...edgeForm,
                    confidence: event.target.checked ? 'verified' : 'inferred',
                  })
                }
                type="checkbox"
              />
              Verified
            </label>
          </div>
          <FieldLabel label="Source URL">
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              onChange={(event) => setEdgeForm({ ...edgeForm, sourceUrl: event.target.value })}
              placeholder="https://..."
              type="url"
              value={edgeForm.sourceUrl}
            />
          </FieldLabel>
          <FieldLabel label="Note">
            <textarea
              className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              onChange={(event) => setEdgeForm({ ...edgeForm, note: event.target.value })}
              value={edgeForm.note}
            />
          </FieldLabel>
          <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="submit">
            Save edge
          </button>
        </form>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Existing nodes</h2>
          <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto text-sm">
            {graph.nodes.map((node) => (
              <li className="flex items-center justify-between gap-3 border-b border-slate-100 py-2" key={node.id}>
                <span>
                  {node.name} <span className="text-slate-400">({node.id})</span>
                </span>
                <button
                  className="text-xs font-medium text-slate-600 underline"
                  onClick={() => {
                    setEditingNodeId(node.id)
                    setNodeForm(nodeToForm(node))
                    setNodeErrors([])
                  }}
                  type="button"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Existing edges</h2>
          <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto text-sm">
            {graph.edges.map((edge) => (
              <li className="flex items-center justify-between gap-3 border-b border-slate-100 py-2" key={edge.id}>
                <span>
                  {edge.id} <span className="text-slate-400">({edge.type})</span>
                </span>
                <button
                  className="text-xs font-medium text-slate-600 underline"
                  onClick={() => {
                    setEditingEdgeId(edge.id)
                    setEdgeForm(edgeToForm(edge))
                    setEdgeErrors([])
                  }}
                  type="button"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
