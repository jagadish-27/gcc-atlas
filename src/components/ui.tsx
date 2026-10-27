import { useEffect, type ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import type { DataSource } from '@/types';
import { sourceMap } from '@/data';
import { formatDate } from '@/lib/format';

interface Props {
  sourceId: string;
  showLabel?: boolean;
  className?: string;
}

export function SourceCitation({ sourceId, showLabel = true, className = '' }: Props) {
  const source: DataSource | undefined = sourceMap[sourceId];
  if (!source) return <span className="text-ink-400 text-xs">Source missing</span>;
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-start gap-1.5 text-xs text-ink-600 hover:text-accent-600 transition-colors ${className}`}
    >
      {showLabel && <span className="font-medium text-ink-500">Source:</span>}
      <span className="underline-offset-2 group-hover:underline decoration-ink-200">
        {source.name}
        <ExternalLink size={11} className="inline-block ml-1 -translate-y-px text-ink-400 group-hover:text-accent-500" />
      </span>
    </a>
  );
}

export function SourceDetail({ source }: { source: DataSource }) {
  return (
    <div className="text-xs text-ink-600 space-y-1">
      <div><span className="text-ink-400">Publisher:</span> {source.publisher}</div>
      <div><span className="text-ink-400">Published:</span> {formatDate(source.publishedDate)}</div>
      <div><span className="text-ink-400">Last accessed:</span> {formatDate(source.accessedDate)}</div>
      <div><span className="text-ink-400">Type:</span> <span className="capitalize">{source.type.replace('-', ' ')}</span></div>
    </div>
  );
}

// Scroll lock helper for drawers/modals
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

export function PageHeader({ title, description, actions, icon }: { title: string; description?: ReactNode; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        {icon && <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700 ring-1 ring-ink-100">{icon}</div>}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-ink-500 leading-relaxed max-w-2xl">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-canvas-subtle/40 px-6 py-12 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-50 text-ink-400">{icon}</div>}
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function DataUnavailable({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-ink-400 ${compact ? 'text-xs' : 'text-sm'}`}>
      <span className="h-1 w-1 rounded-full bg-ink-300" />
      Data unavailable
    </span>
  );
}
