import { useMemo, useState } from 'react';
import { Briefcase, Search, X, MapPin, ExternalLink, AlertTriangle, Filter, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { providers, sourceMap } from '@/data';
import type { ServiceProvider, ProviderCategory } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { Drawer } from '@/components/Drawer';
import { PageHeader, EmptyState, SourceCitation, SourceDetail, useScrollLock } from '@/components/ui';
import { formatDate, uniqueSorted, classNames } from '@/lib/format';

const ALL_CATEGORIES: ProviderCategory[] = [
  'GCC setup and strategy consulting',
  'Legal and regulatory advisory',
  'Tax, accounting, and audit',
  'Recruitment and talent acquisition',
  'Payroll and Employer of Record (EOR)',
  'Commercial real estate and office leasing',
  'Technology and IT services',
  'Corporate administration and compliance',
];

export function ProvidersPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [selected, setSelected] = useState<string | null>(null);

  useScrollLock(selected !== null);

  const locations = useMemo(() => {
    const all = providers.flatMap((p) => p.locations);
    return uniqueSorted(all);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = providers.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.gccServices.toLowerCase().includes(q) && !p.services.some((s) => s.toLowerCase().includes(q))) return false;
      if (category !== 'all' && !p.categories.includes(category as ProviderCategory)) return false;
      if (location !== 'all' && !p.locations.includes(location)) return false;
      if (status !== 'all' && p.verificationStatus !== status) return false;
      return true;
    });
    list = list.sort((a, b) => sort === 'name-asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return list;
  }, [search, category, location, status, sort]);

  const selectedProvider = selected ? providers.find((p) => p.id === selected) : null;

  const hasFilters = category !== 'all' || location !== 'all' || status !== 'all' || search.trim() !== '';
  const clearFilters = () => { setSearch(''); setCategory('all'); setLocation('all'); setStatus('all'); };

  return (
    <div>
      <PageHeader
        icon={<Briefcase size={20} />}
        title="Service Provider Intelligence"
        description="Organizations serving GCC establishment and operations in India. This is NOT an independently validated ranking — provider-published marketing claims are separated from independently documented evidence."
      />

      {/* Trust disclosure */}
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning-600" />
        <div className="text-xs text-warning-600 leading-relaxed">
          <span className="font-semibold">Trust note:</span> No clients, contracts, customer counts, success rates, rankings, or provider performance scores have been invented. Where no documented GCC-specific track record is available, this is stated explicitly. Verify provider capabilities directly before engagement.
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, service or description…" className="input pl-9" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="select" aria-label="Filter by category">
            <option value="all">All categories</option>
            {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="select" aria-label="Filter by location">
            <option value="all">All locations</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select" aria-label="Filter by verification status">
            <option value="all">Any status</option>
            <option value="verified">Verified</option>
            <option value="source_reported">Source-reported</option>
            <option value="reported">Reported</option>
            <option value="needs_verification">Needs verification</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <Filter size={13} />
            <span><span className="font-semibold text-ink-700">{filtered.length}</span> of {providers.length} providers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
              <select value={sort} onChange={(e) => setSort(e.target.value as 'name-asc' | 'name-desc')} className="select text-xs pl-7 py-1.5" aria-label="Sort">
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
            </div>
            {hasFilters && <button onClick={clearFilters} className="btn-ghost text-xs py-1.5 px-2.5 text-ink-600"><X size={13} /> Clear filters</button>}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search size={20} />} title="No providers match your filters" description="Try a different search term or clear one or more filters." action={<button onClick={clearFilters} className="btn-outline">Clear all filters</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => <ProviderCard key={p.id} provider={p} onOpen={() => setSelected(p.id)} />)}
        </div>
      )}

      <Drawer
        open={selectedProvider !== null}
        onClose={() => setSelected(null)}
        title={selectedProvider?.name ?? ''}
        subtitle={selectedProvider?.categories.join(' · ')}
        width="lg"
      >
        {selectedProvider && <ProviderDetail provider={selectedProvider} />}
      </Drawer>
    </div>
  );
}

function ProviderCard({ provider, onOpen }: { provider: ServiceProvider; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="card p-5 card-hover text-left flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink-900 leading-snug">{provider.name}</h3>
        </div>
        <VerificationBadge status={provider.verificationStatus} />
      </div>
      <p className="text-xs text-ink-600 leading-relaxed line-clamp-2 mb-4 flex-1">{provider.gccServices}</p>
      <div className="space-y-2 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {provider.categories.slice(0, 2).map((c) => <span key={c} className="chip bg-accent-50 text-accent-600 text-[10px]">{c}</span>)}
          {provider.categories.length > 2 && <span className="chip bg-ink-50 text-ink-500 text-[10px]">+{provider.categories.length - 2}</span>}
        </div>
        <div className="flex items-center gap-1.5 text-ink-600"><MapPin size={12} className="text-ink-400" /> {provider.locations.slice(0, 3).join(', ')}{provider.locations.length > 3 && ` +${provider.locations.length - 3}`}</div>
      </div>
    </button>
  );
}

function ProviderDetail({ provider }: { provider: ServiceProvider }) {
  const source = sourceMap[provider.sourceId];
  const hasTrackRecord = provider.documentedCases && !provider.documentedCases.includes('No') && !provider.documentedCases.includes('not');
  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap gap-2 mb-3">
          {provider.categories.map((c) => <span key={c} className="chip bg-accent-50 text-accent-600">{c}</span>)}
        </div>
        <p className="text-sm text-ink-700 leading-relaxed">{provider.gccServices}</p>
      </section>

      <section>
        <h4 className="label mb-3">Services offered</h4>
        <div className="flex flex-wrap gap-2">
          {provider.services.map((s) => <span key={s} className="chip bg-ink-50 text-ink-700">{s}</span>)}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 text-sm">
        <div>
          <h4 className="label mb-1.5">Indian markets served</h4>
          <div className="flex flex-wrap gap-1.5">
            {provider.locations.map((l) => <span key={l} className="chip bg-white border border-ink-200 text-ink-600 text-[11px]"><MapPin size={10} /> {l}</span>)}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-ink-100 bg-canvas-subtle/50 p-4">
        <h4 className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-2">Documented client examples & track record</h4>
        <p className="text-sm text-ink-700 leading-relaxed">{provider.documentedCases ?? 'No documented GCC-specific client case studies are available in this dataset.'}</p>
        {!hasTrackRecord && (
          <div className="mt-3 flex items-start gap-2 text-xs text-warning-600 bg-warning-50 rounded-lg px-3 py-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>No independently documented GCC-specific track record is available. Provider-published claims have not been independently verified.</span>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-ink-100 bg-canvas-subtle/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Evidence & verification</h4>
          <VerificationBadge status={provider.verificationStatus} size="md" />
        </div>
        {source && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ink-400" />
              <div className="min-w-0">
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent-600 hover:text-accent-500 inline-flex items-center gap-1">
                  {source.name} <ExternalLink size={11} />
                </a>
                <SourceDetail source={source} />
              </div>
            </div>
            <div className="pt-3 border-t border-ink-100">
              <SourceCitation sourceId={provider.sourceId} />
            </div>
          </div>
        )}
        {provider.notes && (
          <div className="mt-3 text-xs text-ink-500 italic leading-relaxed border-t border-ink-100 pt-3">{provider.notes}</div>
        )}
      </section>

      <section className="text-xs text-ink-500 border-t border-ink-100 pt-3">
        <span className="font-medium text-ink-600">Last checked:</span> {formatDate(provider.lastCheckedDate)}
      </section>
    </div>
  );
}
