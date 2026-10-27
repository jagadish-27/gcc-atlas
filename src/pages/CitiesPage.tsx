import { Fragment, useMemo, useState } from 'react';
import { Map, Plus, X, Check, AlertTriangle, ExternalLink, Scale, Lightbulb } from 'lucide-react';
import { cities, cityMetrics, metricDefinitions, metricDefinitionMap, sourceMap, companies, metricsByCity } from '@/data';
import type { City, CityMetricValue, CityMetricDefinition } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { PageHeader, EmptyState, DataUnavailable, SourceCitation } from '@/components/ui';
import { classNames } from '@/lib/format';

const METRIC_ORDER: CityMetricDefinition['category'][] = ['gcc-presence', 'real-estate', 'talent', 'cost', 'incentives', 'infrastructure'];

const CATEGORY_LABELS: Record<CityMetricDefinition['category'], string> = {
  'gcc-presence': 'GCC presence',
  'real-estate': 'Real estate',
  'talent': 'Talent',
  'cost': 'Cost',
  'incentives': 'Incentives',
  'infrastructure': 'Infrastructure',
};

export function CitiesPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['bengaluru', 'hyderabad']);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return [prev[prev.length - 1], prev[0], id].filter(Boolean) as string[]; // shift window
      return [...prev, id];
    });
  };

  const selectedCities = useMemo(() => selectedIds.map((id) => cities.find((c) => c.id === id)!).filter(Boolean), [selectedIds]);
  const metricsByDef = useMemo(() => {
    return metricDefinitions.map((def) => ({
      def,
      values: selectedIds.map((id) => cityMetrics.find((m) => m.cityId === id && m.metricKey === def.key)),
    }));
  }, [selectedIds]);

  // Comparison summary - deterministic, only from available data
  const summary = useMemo(() => buildComparisonSummary(selectedCities), [selectedCities]);

  if (selectedCities.length < 2) {
    return (
      <div>
        <PageHeader icon={<Map size={20} />} title="City Intelligence" description="Compare Indian business locations side by side. Select two or three cities to begin." />
        <CityPicker selectedIds={selectedIds} onToggle={toggle} />
        <div className="mt-6">
          <EmptyState icon={<Scale size={20} />} title="Select at least two cities" description="Pick two or three cities to see a structured side-by-side comparison of GCC presence, real estate, talent, incentives and infrastructure." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={<Map size={20} />}
        title="City Intelligence"
        description="Structured side-by-side comparison. Each metric has its own value, unit, source, reference period and verification status. Metrics are only shown when supporting data exists."
      />

      <CityPicker selectedIds={selectedIds} onToggle={toggle} />

      {/* Comparison summary */}
      <div className="card p-6 mt-5 mb-6 border-l-4 border-l-accent-400">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-accent-600" />
          <h2 className="text-sm font-semibold text-ink-900">Comparison summary</h2>
          <span className="text-[11px] text-ink-400">Generated from available structured data</span>
        </div>
        <div className="text-sm text-ink-700 leading-relaxed space-y-2">
          {summary.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {summary.caveats.length > 0 && (
          <div className="mt-4 rounded-lg bg-warning-50 border border-warning-100 px-3 py-2.5">
            <div className="flex items-start gap-2 text-xs text-warning-600">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Limitations to note: </span>
                {summary.caveats.join(' ')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* City profile headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {selectedCities.map((city) => <CityProfileCard key={city.id} city={city} />)}
      </div>

      {/* Metric comparison table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100">
          <h2 className="text-sm font-semibold text-ink-900">Metric comparison</h2>
          <p className="text-xs text-ink-500 mt-0.5">Grouped by category. "Data unavailable" is shown where no supporting data exists — values are never invented.</p>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="bg-canvas-subtle/60">
              <tr className="text-left">
                <th className="sticky left-0 bg-canvas-subtle/60 px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider min-w-[220px]">Metric</th>
                {selectedCities.map((c) => (
                  <th key={c.id} className="px-5 py-3 text-xs font-semibold text-ink-700 uppercase tracking-wider min-w-[180px]">{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {METRIC_ORDER.map((cat) => {
                const defs = metricsByDef.filter((m) => m.def.category === cat);
                if (defs.length === 0) return null;
                return (
                  <Fragment key={cat}>
                    <tr className="bg-white">
                      <td colSpan={selectedCities.length + 1} className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500 bg-ink-50/50">
                        {CATEGORY_LABELS[cat]}
                      </td>
                    </tr>
                    {defs.map(({ def, values }) => (
                      <tr key={def.key} className="hover:bg-ink-50/30 transition-colors">
                        <td className="px-5 py-4 align-top">
                          <div className="text-sm font-medium text-ink-800">{def.label}</div>
                          <div className="text-[11px] text-ink-400 mt-0.5 leading-snug max-w-[220px]">{def.description}</div>
                          {!def.comparable && <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-warning-600"><AlertTriangle size={10} /> Not directly comparable</span>}
                        </td>
                        {values.map((v, i) => (
                          <td key={i} className="px-5 py-4 align-top">
                            {v ? <MetricValueCell value={v} /> : <DataUnavailable />}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CityPicker({ selectedIds, onToggle }: { selectedIds: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-ink-600 uppercase tracking-wider">Select cities ({selectedIds.length}/3)</div>
        {selectedIds.length > 0 && <span className="text-[11px] text-ink-400">Pick two or three to compare</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {cities.map((c) => {
          const active = selectedIds.includes(c.id);
          const disabled = !active && selectedIds.length >= 3;
          return (
            <button
              key={c.id}
              onClick={() => onToggle(c.id)}
              disabled={disabled}
              className={classNames(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all',
                active ? 'border-ink-800 bg-ink-800 text-white shadow-sm' : disabled ? 'border-ink-100 bg-ink-50/40 text-ink-300 cursor-not-allowed' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
              )}
            >
              {active ? <Check size={14} /> : <Plus size={14} />}
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CityProfileCard({ city }: { city: City }) {
  const gccCount = metricsByCity(city.id).find((m) => m.metricKey === 'gcc_count');
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-base font-semibold text-ink-900">{city.name}</h3>
        <span className="text-xs text-ink-400">{city.region}</span>
      </div>
      <p className="text-xs text-ink-600 leading-relaxed mb-3">{city.summary}</p>
      {gccCount && (
        <div className="mb-3 rounded-lg bg-canvas-subtle px-3 py-2">
          <div className="text-[11px] text-ink-500 uppercase tracking-wider">Estimated GCCs</div>
          <div className="text-sm font-semibold text-ink-900 mt-0.5">{gccCount.value} <span className="text-xs font-normal text-ink-500">{gccCount.unit}</span></div>
        </div>
      )}
      <div className="mb-3">
        <div className="label mb-1.5">Industry clusters</div>
        <div className="flex flex-wrap gap-1.5">
          {city.industryClusters.map((c) => <span key={c} className="chip bg-accent-50 text-accent-600 text-[10px]">{c}</span>)}
        </div>
      </div>
      <div>
        <div className="label mb-1.5">Investment incentives</div>
        <p className="text-xs text-ink-600 leading-relaxed">{city.incentivesSummary}</p>
        <div className="mt-2 flex items-center gap-2">
          <VerificationBadge status={city.incentiveConfidence} />
          <span className="text-[11px] text-ink-400">{city.incentiveReferencePeriod}</span>
        </div>
        <div className="mt-2"><SourceCitation sourceId={city.incentiveSourceId} /></div>
      </div>
    </div>
  );
}

function MetricValueCell({ value }: { value: CityMetricValue }) {
  const def = metricDefinitionMap[value.metricKey];
  return (
    <div>
      <div className="text-sm font-semibold text-ink-900 tabular-nums">{value.value}</div>
      <div className="text-[11px] text-ink-400">{value.unit}</div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <VerificationBadge status={value.confidence} />
      </div>
      <div className="mt-1 text-[11px] text-ink-400">{value.referencePeriod}</div>
      {value.notes && <div className="mt-1.5 text-[11px] text-ink-500 leading-snug italic max-w-[180px]">{value.notes}</div>}
      <div className="mt-1.5"><SourceCitation sourceId={value.sourceId} showLabel={false} /></div>
    </div>
  );
}

// Deterministic comparison summary. Only uses available structured data.
// Never claims a city is "best" unless a single metric dominates across the
// priorities the user might weight — and even then, only with explicit caveat.
function buildComparisonSummary(selected: City[]): { paragraphs: string[]; caveats: string[] } {
  const paragraphs: string[] = [];
  const caveats: string[] = [];

  if (selected.length === 0) return { paragraphs, caveats };

  const names = selected.map((c) => c.name);
  paragraphs.push(`This comparison covers ${names.join(', ')} using the structured metrics available in the GCC Atlas dataset. It is not a ranking.`);

  // GCC presence
  const presence = selected.map((c) => {
    const m = metricsByCity(c.id).find((v) => v.metricKey === 'gcc_count');
    return { city: c, value: m?.value, conf: m?.confidence };
  });
  const withPresence = presence.filter((p) => p.value);
  if (withPresence.length === selected.length) {
    paragraphs.push(
      `On estimated GCC presence, ${withPresence.map((p) => `${p.city.name} (${p.value})`).join(', ')} are recorded. These are derived estimates, not census counts.`,
    );
    caveats.push('GCC count figures are "Estimated" — derived from industry-report aggregates, not a verified census.');
  } else if (withPresence.length > 0) {
    paragraphs.push(`GCC presence data is available for ${withPresence.map((p) => p.city.name).join(' and ')}; for the other selected city/cities the figure is currently unavailable.`);
  }

  // Rent
  const rents = selected.map((c) => {
    const m = metricsByCity(c.id).find((v) => v.metricKey === 'office_rent_grade_a');
    return { city: c, value: m?.value, ref: m?.referencePeriod };
  }).filter((r) => r.value);
  if (rents.length >= 2) {
    const sorted = [...rents].sort((a, b) => parseFloat(a.value!) - parseFloat(b.value!));
    paragraphs.push(
      `For Grade-A office rent (${rents[0].ref}), ${sorted[0].city.name} shows the lowest figure among the selected cities at ₹${sorted[0].value}/sq.ft./month, while ${sorted[sorted.length - 1].city.name} is highest at ₹${sorted[sorted.length - 1].value}/sq.ft./month. Rents reflect asking rents in each city's prime sub-market and are not directly comparable across sub-market definitions.`,
    );
  }

  // Talent salary
  const salaries = selected.map((c) => {
    const m = metricsByCity(c.id).find((v) => v.metricKey === 'avg_salary_mid_engineer');
    return { city: c, value: m?.value };
  }).filter((s) => s.value);
  if (salaries.length >= 2) {
    paragraphs.push(
      `Median mid-level engineer compensation ranges from ₹${Math.min(...salaries.map((s) => parseFloat(s.value!)))} to ₹${Math.max(...salaries.map((s) => parseFloat(s.value!)))} lakh/year across the selected cities (FY 2024, reported). Salary differentials should be read alongside cost-of-living and talent-pool depth, not in isolation.`,
    );
  }

  // Incentives caveat
  caveats.push('Incentive structures are set by individual state policies and differ in eligibility, caps and reference periods — they are flagged as not directly comparable.');

  // Missing data
  const totalPossible = selected.length * metricDefinitions.length;
  const available = selected.reduce((acc, c) => acc + metricsByCity(c.id).length, 0);
  const missing = totalPossible - available;
  if (missing > 0) {
    paragraphs.push(`${missing} of ${totalPossible} possible city-metric cells have no supporting data and are shown as "Data unavailable" rather than filled with estimates.`);
  }

  return { paragraphs, caveats };
}
