export type NodeType = 'person' | 'firm' | 'company'

export type Segment =
  | 'money-center-bank'
  | 'asset-management'
  | 'trading'
  | 'market-infrastructure'
  | 'insurance'
  | 'fintech'
  | 'crypto'
  | 'vendor'
  | 'investor'
  | 'internal'

export type GraphNode = {
  id: string
  type: NodeType
  name: string
  segment?: Segment
  role?: string
  hq?: string
  isTargetAccount?: boolean
  isExistingCustomer?: boolean
  notes?: string
}

export type EdgeType =
  | 'founded'
  | 'employed_at'
  | 'board_seat'
  | 'chairman_of'
  | 'invested_in'
  | 'led_round'
  | 'co_invested_with'
  | 'customer_of'
  | 'partner_of'
  | 'acquired'

export type GraphEdge = {
  id: string
  source: string
  target: string
  type: EdgeType
  startDate?: string
  endDate?: string
  current: boolean
  confidence: 'verified' | 'inferred'
  sourceUrl?: string
  note?: string
}

export type AccountGraph = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
