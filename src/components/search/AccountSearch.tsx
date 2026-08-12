import type { Graph } from '../../schema'

export type AccountSearchProps = {
  graph: Graph
  onSelectCompany: (companyId: string) => void
}

export function AccountSearch({ graph, onSelectCompany }: AccountSearchProps) {
  void graph
  void onSelectCompany
  return null
}
