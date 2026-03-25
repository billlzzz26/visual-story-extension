import React, { useState } from 'react'

type ActiveView = 'editor' | 'graph' | 'timeline' | 'insights'

interface NavItem {
  id: ActiveView
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'editor', label: 'Editor', icon: '✏️' },
  { id: 'graph', label: 'Graph', icon: '🕸️' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'insights', label: 'Insights', icon: '📊' },
]

function App(): React.ReactElement {
  const [activeView, setActiveView] = useState<ActiveView>('editor')

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 min-w-[240px] bg-white border-r border-slate-200 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm select-none">
            VSP
          </div>
          <span className="font-semibold text-slate-800 tracking-tight">
            Visual Story Planner
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              aria-current={activeView === item.id ? 'page' : undefined}
              className={[
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                activeView === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom settings area */}
        <div className="px-2 py-4 border-t border-slate-100">
          <button
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            aria-label="Settings"
          >
            <span aria-hidden="true">⚙️</span>
            Settings
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <h1 className="text-lg font-semibold text-slate-800 capitalize">
            {activeView}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Visual Story Planner v0.1.0</span>
          </div>
        </header>

        {/* View content */}
        <div className="flex-1 overflow-auto p-6">
          <ViewContent activeView={activeView} />
        </div>
      </main>
    </div>
  )
}

function ViewContent({ activeView }: { activeView: ActiveView }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-10 max-w-md w-full">
        <div className="text-4xl mb-4">
          {NAV_ITEMS.find((i) => i.id === activeView)?.icon ?? '📄'}
        </div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2 capitalize">
          {activeView} View
        </h2>
        <p className="text-slate-500 text-sm">
          This is a placeholder for the <strong className="text-slate-700">{activeView}</strong>{' '}
          feature. Implementation coming soon.
        </p>
      </div>
    </div>
  )
}

export default App
