import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HOME_COMPANY_ID } from '../data/graph'
import { summarizeAccount, type AccountSummary } from '../lib/paths'
import type { AccountGraph, Segment } from '../types'

type StatusFilter = 'all' | AccountSummary['status']
type SortKey = 'account' | 'segment' | 'status' | 'hops' | 'connector' | 'confidence'
type SortDirection = 'asc' | 'desc'

type AccountsPageProps = {
  graph: AccountGraph
  now: Date
}

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

const statusLabels: Record<StatusFilter, string> = {
  all: 'All statuses',
  customer: 'Customer',
  'warm-path': 'Warm path',
  cold: 'Cold',
}

const statusOrder: Record<AccountSummary['status'], number> = {
  customer: 0,
  'warm-path': 1,
  cold: 2,
}

function statusClass(status: AccountSummary['status']): string {
  if (status === 'customer') return 'bg-emerald-100 text-emerald-800'
  if (status === 'warm-path') return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-700'
}

function compareValues(left: string | number, right: string | number): number {
  if (typeof left === 'number' && typeof right === 'number') return left - right
  return String(left).localeCompare(String(right))
}

function valueForSort(summary: AccountSummary, key: SortKey): string | number {
  switch (key) {
    case 'account':
      return summary.account.name
    case 'segment':
      return summary.account.segment ?? ''
    case 'status':
      return statusOrder[summary.status]
    case 'hops':
      return summary.bestPath?.hops ?? Number.POSITIVE_INFINITY
    case 'connector':
      return summary.connector?.name ?? ''
    case 'confidence':
      return summary.bestPath?.allVerified ? 0 : summary.bestPath === null ? 2 : 1
  }
}

export function AccountsPage({ graph, now }: AccountsPageProps) {
  const [segment, setSegment] = useState<Segment | 'all'>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('account')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const summaries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const rows = graph.nodes
      .filter((node) => node.isTargetAccount === true)
      .map((account) =>
        summarizeAccount(graph, HOME_COMPANY_ID, account.id, { now, verifiedOnly }),
      )
      .filter((summary): summary is AccountSummary => summary !== null)
      .filter((summary) => segment === 'all' || summary.account.segment === segment)
      .filter((summary) => status === 'all' || summary.status === status)
      .filter((summary) => summary.account.name.toLowerCase().includes(normalizedQuery))

    return rows.sort((left, right) => {
      const comparison = compareValues(valueForSort(left, sortKey), valueForSort(right, sortKey))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [graph, now, query, segment, sortDirection, sortKey, status, verifiedOnly])

  function changeSort(nextKey: SortKey): void {
    if (sortKey === nextKey) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(nextKey)
      setSortDirection('asc')
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Accounts</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Target accounts</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Ranked paths from Cognition into the target accounts in the seed graph.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">
          Search
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none ring-slate-400 focus:ring-2"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Account name"
            type="search"
            value={query}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Segment
          <select
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal outline-none ring-slate-400 focus:ring-2"
            onChange={(event) => setSegment(event.target.value as Segment | 'all')}
            value={segment}
          >
            <option value="all">All segments</option>
            {segments.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal outline-none ring-slate-400 focus:ring-2"
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            value={status}
          >
            {(Object.keys(statusLabels) as StatusFilter[]).map((option) => (
              <option key={option} value={option}>
                {statusLabels[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700">
          <input
            checked={verifiedOnly}
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
            onChange={(event) => setVerifiedOnly(event.target.checked)}
            type="checkbox"
          />
          Verified paths only
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {(
                [
                  ['account', 'Account'],
                  ['segment', 'Segment'],
                  ['status', 'Status'],
                  ['hops', 'Best path length'],
                  ['connector', 'Connector'],
                  ['confidence', 'Confidence'],
                ] as const
              ).map(([key, label]) => (
                <th className="whitespace-nowrap px-4 py-3 font-semibold" key={key} scope="col">
                  <button
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                    onClick={() => changeSort(key)}
                    type="button"
                  >
                    {label}
                    <span aria-hidden="true">
                      {sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summaries.map((summary) => (
              <tr className="hover:bg-slate-50" key={summary.account.id}>
                <td className="px-4 py-3 font-medium">
                  <Link className="text-slate-900 hover:underline" to={`/account/${summary.account.id}`}>
                    {summary.account.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{summary.account.segment ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(summary.status)}`}>
                    {statusLabels[summary.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{summary.bestPath?.hops ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{summary.connector?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">
                  {summary.bestPath === null ? '—' : summary.bestPath.allVerified ? 'Verified' : 'Inferred'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {summaries.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-500">No accounts match these filters.</p>
        )}
      </div>
    </section>
  )
}
