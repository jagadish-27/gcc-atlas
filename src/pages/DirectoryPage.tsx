import { useMemo, useState } from 'react';
import { Building2, Search, SlidersHorizontal, X, ExternalLink, Calendar, MapPin, Briefcase, CheckCircle2, ArrowUpDown, FileText } from 'lucide-react';
import { companies, sourceMap } from '@/data';
import type { Company, VerificationStatus, GccFunction } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { Drawer } from '@/components/Drawer';
import { PageHeader, EmptyState, SourceCitation, SourceDetail, useScrollLock } from '@/components/ui';
import { formatDate, uniqueSorted, classNames } from '@/lib/format';

type SortKey = 'name-asc' | 'name-desc' | 'year-asc' | 'year-desc';

const ALL_FUNCTIONS: GccFunction[] = [
  'Engineering & R&D', 'IT & Infrastructure', 'Data & Analytics', 'Finance & Accounting',
  'HR & Talent', 'Customer Support', 'Product & Design', 'Procurement & Supply Chain',
  'Legal & Compliance', 'Marketing & Growth', 'Sales Operations',
];

export function DirectoryPage({ initialCompanyId, onClearInitial }: { initialCompanyId?: string; onClearInitial: () => void }) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [industry, setIndustry] = useState('all');
  const [func, setFunc] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<SortKey>('name-asc');
  const [selected, setSelected] = useState<string | null>(initialCompanyId ?? null);

  useScrollLock(selected !== null);

  const cities = useMemo(() => uniqueSorted(companies.map((c) => c.city)), []);
  const industries = useMemo(() => uniqueSorted(companies.map((c) => c.industry)), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = companies.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !(c.parentCompany ?? '').toLowerCase().includes(q) && !c.description.toLowerCase().includes(q)) return false;
      if (city !== 'all' && c.city !== city) return false;
      if (industry !== 'all' && c.industry !== industry) return false;
      if (func !== 'all' && !c.functions.includes(func as GccFunction)) return false;
      if (status !== 'all' && c.verificationStatus !== (status as VerificationStatus)) return false;
      return true;
    });
    list = list.sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'year-asc': return (a.establishmentYear ?? 9999) - (b.establishmentYear ?? 9999);
        case 'year-desc': return (b.establishmentYear ?? 0) - (a.establishmentYear ?? 0);
      }
    });
    return list;
  }, [search, city, industry, func, status, sort]);

  const selectedCompany = selected ? companies.find((c) => c.id === selected) : null;

  const hasActiveFilters = city !== 'all' || industry !== 'all' || func !== 'all' || status !== 'all' || search.trim() !== '';
  const clearFilters = () => {
    setSearch(''); setCity('all'); setIndustry('all'); setFunc('all'); setStatus('all');
  };

  const closeDrawer = () => {
    setSelected(null);
    onClearInitial();
  };

  return (
    <div>
      <PageHeader
        icon={<Building2 size={20} />}
        title="GCC Directory"
        description="Searchable, filterable records of global capability centres in India. Confirmed GCCs are distinguished from records that still require verification."
      />

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, parent or description…" className="input pl-9" />
          </div>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="select" aria-label="Filter by city">
            <option value="all">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="select" aria-label="Filter by industry">
            <option value="all">All industries</option>
            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={func} onChange={(e) => setFunc(e.target.value)} className="select" aria-label="Filter by GCC function">
            <option value="all">All functions</option>
            {ALL_FUNCTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select" aria-label="Filter by verification status">
            <option value="all">Any status</option>
            <option value="verified">Verified</option>
            <option value="reported">Reported</option>
            <option value="estimated">Estimated</option>
            <option value="needs_verification">Needs verification</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <SlidersHorizontal size={13} />
            <span><span className="font-semibold text-ink-700">{filtered.length}</span> of {companies.length} records</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="select text-xs pl-7 py-1.5" aria-label="Sort">
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="year-asc">Year (oldest first)</option>
                <option value="year-desc">Year (newest first)</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-ghost text-xs py-1.5 px-2.5 text-ink-600">
                <X size={13} /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={20} />}
          title="No records match your filters"
          description="Try widening your search or clearing one or more filters."
          action={<button onClick={clearFilters} className="btn-outline">Clear all filters</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => <CompanyCard key={c.id} company={c} onOpen={() => setSelected(c.id)} />)}
        </div>
      )}

      <Drawer
        open={selectedCompany !== null}
        onClose={closeDrawer}
        title={selectedCompany?.name ?? ''}
        subtitle={selectedCompany?.parentCompany ? `Parent: ${selectedCompany.parentCompany}` : undefined}
        width="lg"
      >
        {selectedCompany && <CompanyDetail company={selectedCompany} />}
      </Drawer>
    </div>
  );
}

function CompanyCard({ company, onOpen }: { company: Company; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="card p-5 card-hover text-left flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink-900 leading-snug">{company.name}</h3>
          {company.parentCompany && <p className="text-xs text-ink-500 mt-0.5 truncate">{company.parentCompany}</p>}
        </div>
        <VerificationBadge status={company.verificationStatus} />
      </div>
      <p className="text-xs text-ink-600 leading-relaxed line-clamp-2 mb-4 flex-1">{company.description}</p>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-ink-600"><MapPin size={12} className="text-ink-400" /> {company.city}</div>
        <div className="flex items-center gap-1.5 text-ink-600"><Briefcase size={12} className="text-ink-400" /> {company.industry}</div>
        {company.establishmentYear && <div className="flex items-center gap-1.5 text-ink-600"><Calendar size={12} className="text-ink-400" /> Est. {company.establishmentYear}</div>}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-ink-100">
        {company.functions.slice(0, 3).map((f) => (
          <span key={f} className="chip bg-accent-50 text-accent-600 text-[10px]">{f}</span>
        ))}
        {company.functions.length > 3 && <span className="chip bg-ink-50 text-ink-500 text-[10px]">+{company.functions.length - 3}</span>}
      </div>
    </button>
  );
}

function CompanyDetail({ company }: { company: Company }) {
  const source = sourceMap[company.sourceId];
  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="chip bg-ink-50 text-ink-700">{company.city}</span>
          <span className="chip bg-accent-50 text-accent-600">{company.industry}</span>
          <span className={classNames('chip', company.operatingStatus === 'active' ? 'bg-success-100 text-success-600' : 'bg-ink-50 text-ink-600')}>
            {company.operatingStatus === 'active' && <CheckCircle2 size={11} />}
            {company.operatingStatus === 'active' ? 'Active' : company.operatingStatus === 'inactive' ? 'Inactive' : 'Status unknown'}
          </span>
        </div>
        <p className="text-sm text-ink-700 leading-relaxed">{company.description}</p>
      </section>

      <section className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <DetailRow label="Parent company" value={company.parentCompany ?? '—'} />
        <DetailRow label="Establishment year" value={company.establishmentYear ? String(company.establishmentYear) : 'Not verified'} />
        <DetailRow label="City" value={company.city} />
        <DetailRow label="Industry" value={company.industry} />
        <DetailRow label="Operating status" value={company.operatingStatus === 'active' ? 'Active' : company.operatingStatus === 'inactive' ? 'Inactive' : 'Unknown'} />
        <DetailRow label="Last verified" value={formatDate(company.lastVerifiedDate)} />
      </section>

      <section>
        <h4 className="label mb-3">GCC functions</h4>
        <div className="flex flex-wrap gap-2">
          {company.functions.map((f) => <span key={f} className="chip bg-accent-50 text-accent-600">{f}</span>)}
        </div>
      </section>

      <section className="rounded-lg border border-ink-100 bg-canvas-subtle/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Evidence & verification</h4>
          <VerificationBadge status={company.verificationStatus} size="md" />
        </div>
        {source && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <FileText size={14} className="mt-0.5 shrink-0 text-ink-400" />
              <div className="min-w-0">
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent-600 hover:text-accent-500 inline-flex items-center gap-1">
                  {source.name} <ExternalLink size={11} />
                </a>
                <SourceDetail source={source} />
              </div>
            </div>
            <div className="pt-3 border-t border-ink-100">
              <SourceCitation sourceId={company.sourceId} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="mt-1 text-ink-800 font-medium">{value}</dd>
    </div>
  );
}
