import { useMemo, useState } from 'react';
import { Activity, Search, X, ExternalLink, Calendar, MapPin, Tag, Filter, ArrowRight } from 'lucide-react';
import { signals, sourceMap } from '@/data';
import type { SignalCategory, VerificationStatus } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { PageHeader, EmptyState, SourceCitation } from '@/components/ui';
import { formatDate, classNames } from '@/lib/format';

const CATEGORIES: SignalCategory[] = [
  'New GCC establishment',
  'Expansion',
  'Investment announcement',
  'Office lease or relocation',
  'Hiring activity',
  'Government policy or incentive',
];

export function SignalsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = signals.filter((s) => {
      if (q && !s.headline.toLowerCase().includes(q) && !s.company.toLowerCase().includes(q) && !s.summary.toLowerCase().includes(q)) return false;
      if (category !== 'all' && s.category !== category) return false;
      if (status !== 'all' && s.verificationStatus !== (status as VerificationStatus)) return false;
      return true;
    });
    list = list.sort((a, b) => sort === 'newest' ? b.publicationDate.localeCompare(a.publicationDate) : a.publicationDate.localeCompare(b.publicationDate));
    return list;
  }, [search, category, status, sort]);

  const hasFilters = search.trim() || category !== 'all' || status !== 'all';
  const clear = () => { setSearch(''); setCategory('all'); setStatus('all'); };

  return (
    <div>
      <PageHeader
        icon={<Activity size={20} />}
        title="Market Signals"
        description="A searchable feed of GCC-related developments sourced from real publications. Every signal links to its original source — no announcements are fabricated."
      />

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search headlines, companies or summaries…" className="input pl-9" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="select" aria-label="Filter by category">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select" aria-label="Filter by verification status">
            <option value="all">Any status</option>
            <option value="verified">Verified</option>
            <option value="reported">Reported</option>
            <option value="estimated">Estimated</option>
            <option value="needs_verification">Needs verification</option>
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <Filter size={13} />
            <span><span className="font-semibold text-ink-700">{filtered.length}</span> of {signals.length} signals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')} className="select text-xs py-1.5" aria-label="Sort">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
            {hasFilters && <button onClick={clear} className="btn-ghost text-xs py-1.5 px-2.5"><X size={13} /> Clear filters</button>}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search size={20} />} title="No signals match your filters" description="Try a different search term or clear one or more filters." action={<button onClick={clear} className="btn-outline">Clear filters</button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const source = sourceMap[s.sourceId];
            return (
              <article key={s.id} className="card p-5 card-hover">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="chip bg-accent-50 text-accent-600 text-[11px]"><Tag size={10} /> {s.category}</span>
                      <VerificationBadge status={s.verificationStatus} />
                    </div>
                    <h3 className="text-base font-semibold text-ink-900 leading-snug">{s.headline}</h3>
                    <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{s.summary}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
                      <span className="flex items-center gap-1.5 font-medium text-ink-700">{s.company}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-ink-400" /> {s.city}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} className="text-ink-400" /> Published {formatDate(s.publicationDate)}</span>
                      {s.eventDate && <span className="flex items-center gap-1"><Calendar size={12} className="text-ink-400" /> Event {formatDate(s.eventDate)}</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between gap-3">
                  <SourceCitation sourceId={s.sourceId} />
                  {source && (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs py-1.5 px-2.5 text-accent-600 hover:bg-accent-50">
                      Open source <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
