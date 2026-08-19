import { NavLink, Outlet } from 'react-router-dom'

type AccountPathLayoutProps = {
  accountDetailId?: string
}

export function AccountPathLayout({ accountDetailId }: AccountPathLayoutProps) {
  const links = [
    { to: '/', label: 'Accounts' },
    ...(accountDetailId === undefined
      ? []
      : [{ to: `/account/${accountDetailId}`, label: 'Detail' }]),
    { to: '/graph', label: 'Graph' },
    { to: '/edit', label: 'Edit' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <NavLink className="text-lg font-semibold tracking-tight" to="/">
            AccountPath
          </NavLink>
          <nav aria-label="AccountPath navigation" className="flex items-center gap-2">
            {links.map((link) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
