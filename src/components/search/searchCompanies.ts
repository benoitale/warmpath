import type { CompanyNode, Graph } from '../../schema'

export function searchCompanies(graph: Graph, query: string): CompanyNode[] {
  const q = query.trim().toLowerCase()
  const companies = graph.nodes.filter((node): node is CompanyNode => node.type === 'company')
  if (q === '') return companies
  return companies.filter(
    (company) =>
      company.name.toLowerCase().includes(q) ||
      company.aliases.some((alias) => alias.toLowerCase().includes(q)),
  )
}
