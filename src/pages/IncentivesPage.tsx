import { useMemo, useState } from 'react';
import { Landmark, Search, X, ExternalLink, AlertTriangle, Filter, ArrowUpDown, Calendar, Building, FileText } from 'lucide-react';
import { incentives, sourceMap } from '@/data';
import type { IncentiveRecord, IncentiveType, IncentivePolicyStatus } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { Drawer } from '@/components/Drawer';
import { PageHeader, EmptyState, SourceCitation, SourceDetail, useScrollLock } from '@/components/ui';
import { formatDate, uniqueSorted, classNames, incentiveStatusLabels, incentiveStatusStyles, freshness } from '@/lib/format';

const ALL_TYPES: IncentiveType[] = [
  'Capital expenditure support',
  'Employment or payroll-linked incentive',
  'Lease or rental support',
  'Stamp duty concession',
  'Electricity-related benefit',
  'Research and innovation support',
  'Other business incentive',
];

export function IncentivesPage() {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('all');
  const [type, setType] = useState('all');
  const [policyStatus, setPolicyStatus] = useState('all');
  const [sort, setSort] = useState<'state-asc' | 'recent'>('state-asc');
  const [selected, setSelected] = useState<string | null>(null);

  useScrollLock(selected !== null);

  const states = useMemo(() => uniqueSorted(incentives.map((i) => i.state)), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = incentives.filter((i) => {
      if (q && !i.policyName.toLowerCase().includes(q) && !i.benefitDetails.toLowerCase().includes(q) && !i.state.toLowerCase().includes(q)) return false;
      if (state !== 'all' && i.state !== state) return false;
      if (type !== 'all' && i.incentiveType !== type) return false;
      if (policyStatus !== 'all' && i.policyStatus !== policyStatus) return false;
      return true;
    });
    list = list.sort((a, b) => sort === 'state-asc' ? a.state.localeCompare(b.state) : b.lastCheckedDate.localeCompare(a.lastCheckedDate));
    return list;
  }, [search, state, type, policyStatus, sort]);

  const selectedIncentive = selected ? incentives.find((i) => i.id === selected) : null;

  const hasFilters = state !== 'all' || type !== 'all' || policyStatus !== 'all' || search.trim() !== '';
  const clearFilters = () => { setSearch(''); setState('all'); setType('all'); setPolicyStatus('all'); };

  return (
    <div>
      <PageHeader
        icon={<Landmark size={20} />}
        title="State Incentives Explorer"
        description="Indian state policies and incentives relevant to GCC establishment or expansion. Only benefits documented in official policy text are listed — no incentive details are invented."
      />

      {/* Trust disclosure */}
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning-600" />
        <div className="text-xs text-warning-600 leading-relaxed">
          <span className="font-semibold">Eligibility warning:</span> Never assume that an incentive applies to every GCC. Eligibility may depend on company size, location tier, investment threshold, employment count, or application conditions. Always check the official source and issuing authority for current applicability.
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by policy, state or benefit…" className="input pl-9" />
          </div>
          <select value={state} onChange={(e) => setState(e.target.value)} className="select" aria-label="Filter by state">
            <option value="all">All states</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="select" aria-label="Filter by incentive type">
            <option value="all">All incentive types</option>
            {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={policyStatus} onChange={(e) => setPolicyStatus(e.target.value)} className="select" aria-label="Filter by policy status">
            <option value="all">All policy statuses</option>
            <option value="active">Active policy</option>
            <option value="historical">Historical policy</option>
            <option value="announced_unconfirmed">Announced — unconfirmed</option>
            <option value="eligibility_unclear">Eligibility unclear</option>
            <option value="needs_verification">Needs verification</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <Filter size={13} />
            <span><span className="font-semibold text-ink-700">{filtered.length}</span> of {incentives.length} incentive records</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
              <select value={sort} onChange={(e) => setSort(e.target.value as 'state-asc' | 'recent')} className="select text-xs pl-7 py-1.5" aria-label="Sort">
                <option value="state-asc">State A–Z</option>
                <option value="recent">Last checked (newest)</option>
              </select>
            </div>
            {hasFilters && <button onClick={clearFilters} className="btn-ghost text-xs py-1.5 px-2.5 text-ink-600"><X size={13} /> Clear filters</button>}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search size={20} />} title="No incentives match your filters" description="Try a different search term or clear one or more filters." action={<button onClick={clearFilters} className="btn-outline">Clear all filters</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inc) => <IncentiveCard key={inc.id} incentive={inc} onOpen={() => setSelected(inc.id)} />)}
        </div>
      )}

      <Drawer
        open={selectedIncentive !== null}
        onClose={() => setSelected(null)}
        title={selectedIncentive?.policyName ?? ''}
        subtitle={selectedIncentive ? `${selectedIncentive.state} · ${selectedIncentive.incentiveType}` : undefined}
        width="lg"
      >
        {selectedIncentive && <IncentiveDetail incentive={selectedIncentive} />}
      </Drawer>
    </div>
  );
}

function IncentiveCard({ incentive, onOpen }: { incentive: IncentiveRecord; onOpen: () => void }) {
  const fresh = freshness(incentive.lastCheckedDate);
  return (
    <button onClick={onOpen} className="card p-5 card-hover text-left flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <span className="chip bg-ink-50 text-ink-700 text-[10px]">{incentive.state}</span>
        </div>
        <span className={classNames('chip text-[10px]', incentiveStatusStyles[incentive.policyStatus])}>{incentiveStatusLabels[incentive.policyStatus]}</span>
      </div>
      <h3 className="text-sm font-semibold text-ink-900 leading-snug mb-1.5">{incentive.policyName}</h3>
      <p className="text-xs text-ink-600 leading-relaxed line-clamp-2 mb-3 flex-1">{incentive.benefitDetails}</p>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="chip bg-accent-50 text-accent-600 text-[10px]">{incentive.incentiveType}</span>
        <span className={fresh.color}>{fresh.label}</span>
      </div>
    </button>
  );
}

function IncentiveDetail({ incentive }: { incentive: IncentiveRecord }) {
  const source = sourceMap[incentive.sourceId];
  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="chip bg-ink-50 text-ink-700">{incentive.state}</span>
          <span className="chip bg-accent-50 text-accent-600">{incentive.incentiveType}</span>
          <span className={classNames('chip', incentiveStatusStyles[incentive.policyStatus])}>{incentiveStatusLabels[incentive.policyStatus]}</span>
        </div>
        <p className="text-sm text-ink-700 leading-relaxed">{incentive.benefitDetails}</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <DetailRow icon={<Building size={13} />} label="Issuing authority" value={incentive.issuingAuthority} />
        <DetailRow icon={<Calendar size={13} />} label="Effective period" value={incentive.effectivePeriod} />
        <DetailRow icon={<Calendar size={13} />} label="Expiry date" value={incentive.expiryDate ? formatDate(incentive.expiryDate) : 'Not stated'} />
        <DetailRow icon={<FileText size={13} />} label="Last checked" value={formatDate(incentive.lastCheckedDate)} />
      </section>

      <section>
        <h4 className="label mb-2">Eligibility conditions</h4>
        <p className="text-sm text-ink-700 leading-relaxed rounded-lg border border-ink-100 bg-canvas-subtle/50 p-3">{incentive.eligibility}</p>
      </section>

      {incentive.notes && (
        <section className="rounded-lg bg-warning-50 border border-warning-100 px-3 py-2.5">
          <div className="flex items-start gap-2 text-xs text-warning-600">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span className="leading-relaxed">{incentive.notes}</span>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-ink-100 bg-canvas-subtle/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Official source</h4>
        </div>
        {source && (
          <div className="space-y-3">
            <a href={incentive.officialUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent-600 hover:text-accent-500 inline-flex items-center gap-1">
              {source.name} <ExternalLink size={11} />
            </a>
            <SourceDetail source={source} />
            <div className="pt-3 border-t border-ink-100">
              <SourceCitation sourceId={incentive.sourceId} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="label flex items-center gap-1.5">{icon} {label}</dt>
      <dd className="mt-1 text-ink-800 font-medium">{value}</dd>
    </div>
  );
}
