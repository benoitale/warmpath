import { useMemo, useState } from 'react'
import type { EdgeType, Graph, Node } from '../../schema'
import { buildWeb, WEB_HEIGHT, WEB_WIDTH } from './buildWeb'
import { formatEdgePeriod, summarizeNode } from './summarizeNode'

export type GraphViewProps = {
  graph: Graph
  focusCompanyId: string | null
}

const EDGE_COLORS: Record<EdgeType, string> = {
  board_seat: '#7c3aed',
  investor_portfolio: '#2563eb',
  exec_employment: '#059669',
  co_investor: '#d97706',
  customer_reference: '#db2777',
  cohort: '#6b7280',
}

const EDGE_LABELS: Record<EdgeType, string> = {
  board_seat: 'Board seat',
  investor_portfolio: 'Investor portfolio',
  exec_employment: 'Executive employment',
  co_investor: 'Co-investor',
  customer_reference: 'Customer reference',
  cohort: 'Cohort',
}

const NODE_COLORS: Record<Node['type'], string> = {
  fund: '#f59e0b',
  company: '#3b82f6',
  person: '#10b981',
}

export function GraphView({ graph, focusCompanyId }: GraphViewProps) {
  const web = useMemo(() => buildWeb(graph, focusCompanyId), [graph, focusCompanyId])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [prevFocusCompanyId, setPrevFocusCompanyId] = useState(focusCompanyId)
  if (prevFocusCompanyId !== focusCompanyId) {
    setPrevFocusCompanyId(focusCompanyId)
    setSelectedNodeId(null)
  }

  const usedEdgeTypes = useMemo(
    () => new Set(web.edges.map((webEdge) => webEdge.edge.type)),
    [web],
  )
  const summary = useMemo(
    () => (selectedNodeId !== null ? summarizeNode(graph, selectedNodeId) : null),
    [graph, selectedNodeId],
  )

  if (web.nodes.length === 0) {
    return <p className="text-sm text-gray-500">No nodes to display.</p>
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${WEB_WIDTH} ${WEB_HEIGHT}`}
        className="w-full rounded border border-gray-200 bg-white"
        role="img"
        aria-label="Connection web"
      >
        {web.edges.map(({ edge, from, to }) => (
          <g key={edge.id}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={EDGE_COLORS[edge.type]}
              strokeWidth={edge.confidence === 'high' ? 2 : 1}
              strokeDasharray={edge.end_date !== null ? '4 3' : undefined}
              opacity={
                selectedNodeId === null || edge.from === selectedNodeId || edge.to === selectedNodeId
                  ? 0.75
                  : 0.2
              }
            >
              <title>
                {EDGE_LABELS[edge.type]}: {edge.notes}
              </title>
            </line>
          </g>
        ))}
        {web.nodes.map(({ node, x, y, depth }) => (
          <g
            key={node.id}
            onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
            className="cursor-pointer"
            role="button"
            aria-label={`Show connections of ${node.name}`}
          >
            <circle
              cx={x}
              cy={y}
              r={depth === 0 ? 14 : 9}
              fill={NODE_COLORS[node.type]}
              stroke={node.id === selectedNodeId ? '#dc2626' : depth === 0 ? '#111827' : '#ffffff'}
              strokeWidth={node.id === selectedNodeId ? 3.5 : depth === 0 ? 3 : 1.5}
            >
              <title>
                {node.name} ({node.type})
              </title>
            </circle>
            <text
              x={x}
              y={y - (depth === 0 ? 20 : 14)}
              textAnchor="middle"
              className="fill-gray-800"
              fontSize={depth === 0 ? 14 : 11}
              fontWeight={depth === 0 ? 600 : 400}
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        {(Object.keys(EDGE_LABELS) as EdgeType[])
          .filter((type) => usedEdgeTypes.has(type))
          .map((type) => (
            <span key={type} className="inline-flex items-center gap-1">
              <span className="inline-block h-0.5 w-4" style={{ backgroundColor: EDGE_COLORS[type] }} />
              {EDGE_LABELS[type]}
            </span>
          ))}
        <span className="inline-flex items-center gap-1 text-gray-500">
          Dashed line: relationship ended
        </span>
      </div>
      {summary !== null && (
        <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{summary.node.name}</h3>
              <p className="text-xs text-gray-600">
                {summary.node.type === 'person'
                  ? summary.node.public_role
                  : summary.node.type === 'company'
                    ? `${summary.node.industry} · ${summary.node.employee_band} employees`
                    : 'Investment fund'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              Close
            </button>
          </div>
          {summary.connections.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No recorded connections.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {summary.connections.map(({ edge, otherNode }) => (
                <li key={edge.id} className="text-sm">
                  <span
                    className="mr-2 inline-block rounded px-1.5 py-0.5 text-xs text-white"
                    style={{ backgroundColor: EDGE_COLORS[edge.type] }}
                  >
                    {EDGE_LABELS[edge.type]}
                  </span>
                  <span className="font-medium">{otherNode.name}</span>
                  {formatEdgePeriod(edge) !== '' && (
                    <span className="ml-2 text-xs text-gray-500">{formatEdgePeriod(edge)}</span>
                  )}
                  <span className="ml-2 text-xs text-gray-500">confidence: {edge.confidence}</span>
                  <p className="ml-0 text-xs text-gray-600">
                    {edge.notes}{' '}
                    <a
                      href={edge.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      source
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
