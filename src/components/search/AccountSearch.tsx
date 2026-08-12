import { useMemo, useState } from 'react'
import type { Graph } from '../../schema'
import { searchCompanies } from './searchCompanies'

export type AccountSearchProps = {
  graph: Graph
  onSelectCompany: (companyId: string) => void
}

export function AccountSearch({ graph, onSelectCompany }: AccountSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const results = useMemo(() => searchCompanies(graph, query), [graph, query])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor="account-search">
        Company
      </label>
      <input
        id="account-search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Type a company name or alias"
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
      />
      <ul className="mt-2 divide-y divide-gray-100 rounded border border-gray-200">
        {results.length === 0 && (
          <li className="px-3 py-2 text-sm text-gray-500">No companies match "{query}"</li>
        )}
        {results.map((company) => (
          <li key={company.id}>
            <button
              type="button"
              onClick={() => {
                setSelectedId(company.id)
                onSelectCompany(company.id)
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                selectedId === company.id ? 'bg-gray-100' : ''
              }`}
            >
              <span>
                <span className="font-medium">{company.name}</span>
                <span className="ml-2 text-gray-500">{company.industry}</span>
              </span>
              <span className="text-xs text-gray-400">
                {company.is_target ? 'target' : company.is_customer ? 'customer' : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
