import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { ForceGraphMethods } from 'react-force-graph-2d'
import { HOME_COMPANY_ID } from '../data/graph'
import type { GraphEdge, GraphNode, Segment, AccountGraph } from '../types'

type GraphPageProps = {
  graph: AccountGraph
}

type RenderLink = GraphEdge & {
  source: string | GraphNode
  target: string | GraphNode
}

const CANVAS_HEIGHT = 620

const segmentColors: Record<Segment, string> = {
  'money-center-bank': '#2563eb',
  'asset-management': '#7c3aed',
  trading: '#db2777',
  'market-infrastructure': '#0891b2',
  insurance: '#059669',
  fintech: '#d97706',
  crypto: '#dc2626',
  vendor: '#0f172a',
  investor: '#4f46e5',
  internal: '#64748b',
}

function isNeighbor(graph: AccountGraph, focusedId: string, nodeId: string): boolean {
  return graph.edges.some(
    (edge) =>
      (edge.source === focusedId && edge.target === nodeId) ||
      (edge.target === focusedId && edge.source === nodeId),
  )
}

function endpointId(endpoint: string | GraphNode): string {
  return typeof endpoint === 'string' ? endpoint : endpoint.id
}

export function GraphPage({ graph }: GraphPageProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(0)
  const graphContainerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphEdge> | undefined>(undefined)
  const hasZoomedToFitRef = useRef(false)
  const graphData = useMemo(() => ({ nodes: graph.nodes, links: graph.edges }), [graph])

  useEffect(() => {
    hasZoomedToFitRef.current = false
  }, [graph])

  useEffect(() => {
    const container = graphContainerRef.current
    if (container === null) return

    const updateWidth = (): void => {
      setCanvasWidth(Math.max(320, Math.floor(container.getBoundingClientRect().width)))
    }
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Graph</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Account relationship graph</h1>
        <p className="mt-2 text-sm text-slate-600">
          Click a node to highlight its direct relationships. Click the canvas to clear focus.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-[640px] w-full" ref={graphContainerRef}>
          {canvasWidth > 0 && (
            <ForceGraph2D
              backgroundColor="#ffffff"
              cooldownTicks={120}
              graphData={graphData}
              height={CANVAS_HEIGHT}
              linkColor={(link) => {
                const edge = link as unknown as RenderLink
                const active =
                  focusedId === null ||
                  endpointId(edge.source) === focusedId ||
                  endpointId(edge.target) === focusedId
                return active
                  ? edge.confidence === 'verified'
                    ? 'rgba(15, 23, 42, 0.55)'
                    : 'rgba(100, 116, 139, 0.2)'
                  : 'rgba(148, 163, 184, 0.08)'
              }}
              linkWidth={(link) => {
                const edge = link as unknown as RenderLink
                return edge.confidence === 'verified' ? 1.5 : 1
              }}
              nodeCanvasObject={(node, context, globalScale) => {
                const graphNode = node as unknown as GraphNode
                const active =
                  focusedId === null ||
                  graphNode.id === focusedId ||
                  isNeighbor(graph, focusedId, graphNode.id)
                const isHome = graphNode.id === HOME_COMPANY_ID
                const isTarget = graphNode.isTargetAccount === true
                const color =
                  graphNode.segment === undefined
                    ? '#94a3b8'
                    : segmentColors[graphNode.segment]
                const radius = isHome ? 9 : isTarget ? 7 : graphNode.id === focusedId ? 7 : 5
                context.beginPath()
                context.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false)
                context.fillStyle = active ? color : '#cbd5e1'
                context.globalAlpha = active ? 1 : 0.35
                context.fill()
                if (isHome || isTarget) {
                  context.lineWidth = isHome ? 3 : 2
                  context.strokeStyle = isHome ? '#0f172a' : '#ffffff'
                  context.stroke()
                }
                context.globalAlpha = 1

                const shouldLabel =
                  isHome || isTarget || (focusedId !== null && active)
                if (shouldLabel) {
                  context.font = `${Math.max(8, (isHome ? 12 : 10) / globalScale)}px Sans-Serif`
                  context.textAlign = 'center'
                  context.textBaseline = 'top'
                  context.fillStyle = '#334155'
                  context.fillText(graphNode.name, node.x ?? 0, (node.y ?? 0) + radius + 2)
                }
              }}
              nodeLabel={(node) => (node as unknown as GraphNode).name}
              onBackgroundClick={() => setFocusedId(null)}
              onEngineStop={() => {
                if (!hasZoomedToFitRef.current) {
                  hasZoomedToFitRef.current = true
                  graphRef.current?.zoomToFit(600, 40)
                }
              }}
              onNodeClick={(node) => setFocusedId((node as unknown as GraphNode).id)}
              ref={graphRef}
              width={canvasWidth}
            />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Segment legend</h2>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {(Object.keys(segmentColors) as Segment[]).map((segment) => (
            <span className="inline-flex items-center gap-2 text-xs text-slate-600" key={segment}>
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segmentColors[segment] }}
              />
              {segment}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Verified links are opaque; inferred links are faint. {focusedId === null ? 'No node focused.' : `Focused node: ${focusedId}.`}
        </p>
      </div>
    </section>
  )
}
