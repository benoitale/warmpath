import { Link, useParams } from 'react-router-dom'
import { HOME_COMPANY_ID } from '../data/graph'
import { suggestedAsk } from '../lib/asks'
import { summarizeAccount, type Path, type PathStep } from '../lib/paths'
import type { AccountGraph } from '../types'

type AccountDetailPageProps = {
  graph: AccountGraph
  now: Date
}

function edgeDate(step: PathStep): string {
  if (step.edge.startDate === undefined && step.edge.endDate === undefined) return 'Undated'
  if (step.edge.endDate === undefined) return step.edge.startDate ?? 'Undated'
  return `${step.edge.startDate ?? '?'}–${step.edge.endDate}`
}

function EdgeLabel({ step }: { step: PathStep }) {
  const label = `${step.edge.type} · ${edgeDate(step)}`
  const content =
    step.edge.confidence === 'verified' && step.edge.sourceUrl !== undefined ? (
      <a
        className="underline decoration-slate-400 underline-offset-2 hover:decoration-slate-900"
        href={step.edge.sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        {label}
      </a>
    ) : (
      label
    )

  return (
    <div
      className={`min-w-40 rounded-lg border px-3 py-2 text-center text-xs ${
        step.edge.confidence === 'inferred'
          ? 'border-dashed border-amber-400 bg-amber-50 text-amber-900'
          : 'border-slate-200 bg-slate-50 text-slate-700'
      }`}
    >
      <div>{content}</div>
      {step.edge.confidence === 'inferred' && (
        <span className="mt-1 inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Inferred
        </span>
      )}
      {step.edge.note !== undefined && (
        <p className="mt-1 text-left text-[11px] leading-snug text-slate-600">{step.edge.note}</p>
      )}
    </div>
  )
}

function PathStrip({ path }: { path: Path }) {
  return (
    <div className="flex min-w-max items-center gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      {path.nodes.map((node, index) => {
        const step = path.steps[index]
        return (
          <span className="flex items-center gap-3" key={`${node.id}-${index}`}>
            <span className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
              {node.name}
            </span>
            {step !== undefined && (
              <>
                <span aria-hidden="true" className="text-slate-400">
                  →
                </span>
                <EdgeLabel step={step} />
                <span aria-hidden="true" className="text-slate-400">
                  →
                </span>
              </>
            )}
          </span>
        )
      })}
    </div>
  )
}

export function AccountDetailPage({ graph, now }: AccountDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const summary = id === undefined ? null : summarizeAccount(graph, HOME_COMPANY_ID, id, { now })

  if (summary === null) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Account not found</h1>
        <Link className="text-sm underline" to="/">
          Return to accounts
        </Link>
      </section>
    )
  }

  const remainingPaths = summary.bestPath === null ? [] : summary.paths.slice(1)

  return (
    <section className="space-y-8">
      <div>
        <Link className="text-sm text-slate-500 hover:text-slate-900" to="/">
          ← Back to accounts
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              {summary.account.segment ?? 'Account'}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{summary.account.name}</h1>
          </div>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium capitalize text-slate-700">
            {summary.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Best path</h2>
        {summary.bestPath === null ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No path from Cognition is available under the current path settings.
          </div>
        ) : (
          <PathStrip path={summary.bestPath} />
        )}
      </div>

      {summary.bestPath !== null && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Suggested ask</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {suggestedAsk(summary) ?? 'No suggested ask template matches this connector relationship.'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Other ranked paths</h2>
        {remainingPaths.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            No other paths found.
          </p>
        ) : (
          remainingPaths.map((path, index) => (
            <details className="rounded-xl border border-slate-200 bg-white p-4" key={path.steps.map((step) => step.edge.id).join('|')}>
              <summary className="cursor-pointer text-sm font-medium">
                Path {index + 2}: {path.hops} {path.hops === 1 ? 'hop' : 'hops'} · score{' '}
                {path.score.toFixed(2)} ·{' '}
                {path.allVerified ? 'verified' : 'inferred'}
              </summary>
              <div className="mt-4">
                <PathStrip path={path} />
              </div>
            </details>
          ))
        )}
      </div>
    </section>
  )
}
