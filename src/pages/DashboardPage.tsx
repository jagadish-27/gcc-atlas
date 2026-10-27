import { useMemo, useState } from 'react';
import { Building2, MapPin, Briefcase, Activity, Search, ArrowRight, ShieldAlert, Info, ExternalLink } from 'lucide-react';
import { companies, signals, cities, sourceMap } from '@/data';
import { StatCard } from '@/components/StatCard';
import { HorizontalBars } from '@/components/HorizontalBars';
import { VerificationBadge } from '@/components/VerificationBadge';
import { PageHeader, EmptyState, SourceCitation } from '@/components/ui';
import { formatDate, uniqueSorted } from '@/lib/format';
import type { RouteId } from '@/components/AppShell';

interface Props {
  onNavigate: (r: RouteId) => void;
  onOpenCompany: (id: string) => void;
}

export function DashboardPage({ onNavigate, onOpenCompany }: Props) {
  const [search, setSearch] = useState('');

  const cityCounts = useMemo(() => {
    const map = new Map<string, number>();
    companies.forEach((c) => map.set(c.city, (map.get(c.city) ?? 0) + 1));
    return Array.from(map.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, []);

  const industries = useMemo(() => uniqueSorted(companies.map((c) => c.industry)), []);
  const cityList = uniqueSorted(companies.map((c) => c.city));

  const recentSignals = useMemo(
    () => [...signals].sort((a, b) => b.publicationDate.localeCompare(a.publicationDate)).slice(0, 5),
    [],
  );

  const previewResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies.slice(0, 6);
    return companies.filter((c) => c.name.toLowerCase().includes(q) || (c.parentCompany ?? '').toLowerCase().includes(q)).slice(0, 6);
  }, [search]);

  const totalCompanies = companies.length;
  const totalCities = cityList.length;
  const totalIndustries = industries.length;
  const totalSignals = signals.length;

  return (
    <div>
      <PageHeader
        icon={<Activity size={20} />}
        title="Overview Dashboard"
        description="A live snapshot of the GCC Atlas dataset. All counts are calculated from the records shown — no external benchmarks are used to fill cards."
      />

      {/* Prototype notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-warning-600" />
        <div className="text-sm text-warning-600 leading-relaxed">
          <span className="font-semibold">Research prototype — coverage is limited to the records shown.</span> This dataset is intentionally small and carefully sourced. Counts reflect only what is currently in the dataset, not the full Indian GCC market.
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Company records" value={totalCompanies} hint="Confirmed GCCs and records pending verification" icon={<Building2 size={18} />} accent />
        <StatCard label="Cities covered" value={totalCities} hint={cityList.join(', ')} icon={<MapPin size={18} />} />
        <StatCard label="Industries represented" value={totalIndustries} hint="Across technology, financial services, retail, logistics and more" icon={<Briefcase size={18} />} />
        <StatCard label="Market signals" value={totalSignals} hint="Sourced announcements and developments" icon={<Activity size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* City distribution */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-base font-semibold text-ink-900">Company records by city</h2>
            <span className="text-xs text-ink-400">From current dataset</span>
          </div>
          <p className="text-xs text-ink-500 mb-5">Distribution reflects only the {totalCompanies} records in this prototype, not total market share.</p>
          <HorizontalBars data={cityCounts} />
        </div>

        {/* Recent signals */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-base font-semibold text-ink-900">Recent signals</h2>
            <button onClick={() => onNavigate('signals')} className="text-xs font-medium text-accent-600 hover:text-accent-500 inline-flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <ul className="space-y-3">
            {recentSignals.map((s) => (
              <li key={s.id} className="group">
                <div className="flex items-center gap-2 text-[11px] text-ink-400 mb-0.5">
                  <span className="font-medium text-ink-500">{formatDate(s.publicationDate)}</span>
                  <span className="h-1 w-1 rounded-full bg-ink-200" />
                  <span>{s.city}</span>
                </div>
                <p className="text-sm text-ink-800 leading-snug group-hover:text-ink-900">{s.headline}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="chip bg-ink-50 text-ink-600 text-[10px]">{s.category}</span>
                  <VerificationBadge status={s.verificationStatus} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Company preview */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Company preview</h2>
            <p className="text-xs text-ink-500 mt-0.5">Search the dataset or open the full directory to filter and sort.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies…"
                className="input pl-9"
              />
            </div>
            <button onClick={() => onNavigate('directory')} className="btn-outline whitespace-nowrap">
              Full directory <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {previewResults.length === 0 ? (
          <EmptyState icon={<Search size={20} />} title="No matching companies" description="Try a different search term, or open the full directory to browse all records." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {previewResults.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenCompany(c.id)}
                className="text-left rounded-lg border border-ink-100 bg-white p-4 hover:border-ink-200 hover:shadow-cardhover transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{c.name}</p>
                    {c.parentCompany && <p className="text-xs text-ink-500 truncate">{c.parentCompany}</p>}
                  </div>
                  <VerificationBadge status={c.verificationStatus} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="chip bg-ink-50 text-ink-600 text-[10px]">{c.city}</span>
                  <span className="chip bg-accent-50 text-accent-600 text-[10px]">{c.industry}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Data coverage & limitations */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-ink-500" />
          <h2 className="text-base font-semibold text-ink-900">Data coverage & limitations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-ink-600 leading-relaxed">
          <ul className="space-y-2 list-disc list-outside pl-4 marker:text-ink-300">
            <li>Counts above are computed live from the dataset — they are not market totals. India has an estimated 1,700+ GCCs (NASSCOM-Zinnov); this prototype covers {totalCompanies}.</li>
            <li>Records flagged "Needs verification" are Indian offices of multinationals whose status as a confirmed GCC has not been independently established in the source.</li>
            <li>City metrics use the reference period stated on each value. Comparisons across different periods are flagged in the City Intelligence view.</li>
          </ul>
          <ul className="space-y-2 list-disc list-outside pl-4 marker:text-ink-300">
            <li>Every sourced claim is traceable to its publication. Source links open the original reference.</li>
            <li>&ldquo;Estimated&rdquo; values are derived from stated assumptions (e.g. city GCC counts derived from NASSCOM-Zinnov aggregate figures), not census counts.</li>
            <li>For full details on verification statuses and how to report corrections, see the Methodology page.</li>
          </ul>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
          {Array.from(new Set([...companies, ...signals].map((r) => 'sourceId' in r ? r.sourceId : (r as any).sourceId))).slice(0, 6).map((sid) => {
            const src = sourceMap[sid];
            if (!src) return null;
            return (
              <a key={sid} href={src.url} target="_blank" rel="noopener noreferrer" className="chip bg-white border border-ink-100 text-ink-600 hover:border-ink-200 hover:text-ink-800 text-[11px]">
                {src.publisher} <ExternalLink size={10} />
              </a>
            );
          })}
          <span className="chip bg-ink-50 text-ink-500 text-[11px]">+ more in Methodology</span>
        </div>
      </div>
    </div>
  );
}
