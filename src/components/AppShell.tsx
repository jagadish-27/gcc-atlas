import { useState, type ReactNode } from 'react';
import { Globe, LayoutDashboard, Building2, Map, Activity, Sparkles, BookOpen, Menu, X, ShieldAlert } from 'lucide-react';
import { classNames } from '@/lib/format';

export type RouteId = 'dashboard' | 'directory' | 'cities' | 'signals' | 'brief' | 'methodology';

interface NavItem {
  id: RouteId;
  label: string;
  icon: ReactNode;
  description: string;
}

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} />, description: 'Dashboard' },
  { id: 'directory', label: 'GCC Directory', icon: <Building2 size={18} />, description: 'Company records' },
  { id: 'cities', label: 'City Intelligence', icon: <Map size={18} />, description: 'City comparison' },
  { id: 'signals', label: 'Market Signals', icon: <Activity size={18} />, description: 'Developments feed' },
  { id: 'brief', label: 'AI Market Brief', icon: <Sparkles size={18} />, description: 'Comparison generator' },
  { id: 'methodology', label: 'Methodology', icon: <BookOpen size={18} />, description: 'Data & verification' },
];

interface Props {
  current: RouteId;
  onNavigate: (route: RouteId) => void;
  children: ReactNode;
}

export function AppShell({ current, onNavigate, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentItem = NAV.find((n) => n.id === current)!;

  const handleNav = (id: RouteId) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-ink-100 bg-white">
        <SidebarContent current={current} onNavigate={handleNav} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px] animate-fadeIn" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex w-64 flex-col bg-white border-r border-ink-100 animate-slideIn">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 p-2 rounded-lg text-ink-500 hover:bg-ink-50" aria-label="Close menu">
              <X size={18} />
            </button>
            <SidebarContent current={current} onNavigate={handleNav} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink-100 bg-white/85 backdrop-blur-md px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden btn-ghost -ml-2 p-2 rounded-lg"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden sm:inline text-sm text-ink-400">{currentItem.description}</span>
            <span className="hidden sm:inline text-ink-200">/</span>
            <span className="text-sm font-semibold text-ink-800 truncate">{currentItem.label}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-2.5 py-1 text-[11px] font-medium text-warning-600 ring-1 ring-warning-100">
              <ShieldAlert size={12} /> Research prototype
            </span>
            <span className="hidden sm:inline text-xs text-ink-400">Coverage limited to records shown</span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 animate-fadeIn">
            {children}
          </div>
        </main>

        <footer className="border-t border-ink-100 bg-white px-6 py-4 text-xs text-ink-400">
          <div className="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>GCC Atlas — research prototype. Coverage is limited to the records shown.</span>
            <span>Every sourced claim is traceable to its publication. See Methodology.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarContent({ current, onNavigate }: { current: RouteId; onNavigate: (id: RouteId) => void }) {
  return (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-ink-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 text-white">
          <Globe size={17} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink-900">GCC Atlas</div>
          <div className="text-[11px] text-ink-400">India GCC Intelligence</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={classNames(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active ? 'bg-ink-50 text-ink-900 font-semibold ring-1 ring-ink-100' : 'text-ink-600 hover:bg-ink-50/70 hover:text-ink-800',
              )}
            >
              <span className={classNames('shrink-0', active ? 'text-accent-600' : 'text-ink-400')}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-ink-100 p-4">
        <div className="rounded-lg bg-canvas-subtle p-3 text-[11px] leading-relaxed text-ink-500">
          <p className="font-semibold text-ink-700 mb-1">Research prototype</p>
          Coverage is limited to the records shown. Not professional investment or legal advice.
        </div>
      </div>
    </>
  );
}
