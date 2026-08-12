import { useMemo } from 'react'
import type { EdgeType, Graph, Node } from '../../schema'
import { buildWeb, WEB_HEIGHT, WEB_WIDTH } from './buildWeb'

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
  const usedEdgeTypes = useMemo(
    () => new Set(web.edges.map((webEdge) => webEdge.edge.type)),
    [web],
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
              opacity={0.75}
            >
              <title>
                {EDGE_LABELS[edge.type]}: {edge.notes}
              </title>
            </line>
          </g>
        ))}
        {web.nodes.map(({ node, x, y, depth }) => (
          <g key={node.id}>
            <circle
              cx={x}
              cy={y}
              r={depth === 0 ? 14 : 9}
              fill={NODE_COLORS[node.type]}
              stroke={depth === 0 ? '#111827' : '#ffffff'}
              strokeWidth={depth === 0 ? 3 : 1.5}
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
    </div>
  )
}
