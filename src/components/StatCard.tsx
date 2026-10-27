import type { ReactNode } from 'react';
import { classNames } from '@/lib/format';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
}

export function StatCard({ label, value, hint, icon, accent }: StatCardProps) {
  return (
    <div className={classNames('card p-5 card-hover', accent && 'ring-1 ring-accent-100')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
          {hint && <p className="mt-1.5 text-xs text-ink-500 leading-relaxed">{hint}</p>}
        </div>
        {icon && (
          <div className={classNames('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', accent ? 'bg-accent-50 text-accent-600' : 'bg-ink-50 text-ink-600')}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
