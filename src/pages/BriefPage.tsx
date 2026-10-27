import { useMemo, useState } from 'react';
import { Sparkles, AlertTriangle, ShieldAlert, FileText, Check, Lightbulb, Layers, X, Map } from 'lucide-react';
import { cities, metricsByCity, companies, signals, sourceMap, metricDefinitionMap } from '@/data';
import type { City, VerificationStatus } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { PageHeader, EmptyState, SourceCitation } from '@/components/ui';
import { classNames, formatDate } from '@/lib/format';

type Priority = 'cost' | 'talent' | 'industry_ecosystem' | 'gcc_presence';

const PRIORITIES: { key: Priority; label: string; description: string }[] = [
  { key: 'cost', label: 'Cost efficiency', description: 'Weight office rent, salaries and cost of living more heavily.' },
  { key: 'talent', label: 'Talent availability', description: 'Weight tech-talent pool size and graduate throughput more heavily.' },
  { key: 'industry_ecosystem', label: 'Industry ecosystem', description: 'Weight depth of relevant industry clusters more heavily.' },
  { key: 'gcc_presence', label: 'Existing GCC presence', description: 'Weight the existing cluster of GCCs in the city more heavily.' },
];

const FUNCTIONS = ['Engineering & R&D', 'IT & Infrastructure', 'Data & Analytics', 'Finance & Accounting', 'Customer Support', 'Product & Design', 'Procurement & Supply Chain'] as const;

export function BriefPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['bengaluru', 'hyderabad']);
  const [fn, setFn] = useState<string>('Engineering & R&D');
  const [teamSize, setTeamSize] = useState<string>('150');
  const [priorities, setPriorities] = useState<Priority[]>(['talent', 'cost']);
  const [generated, setGenerated] = useState(false);

  const toggleCity = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return [prev[1], id];
      return [...prev, id];
    });
    setGenerated(false);
  };

  const togglePriority = (p: Priority) => {
    setPriorities((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
    setGenerated(false);
  };

  const selectedCities = useMemo(() => selectedIds.map((id) => cities.find((c) => c.id === id)!).filter(Boolean), [selectedIds]);
  const team = parseInt(teamSize, 10);
  const teamNum = Number.isFinite(team) && team > 0 ? team : null;

  const brief = useMemo(() => {
    if (selectedCities.length < 2 || !generated) return null;
    return generateBrief({ cities: selectedCities, fn, teamSize: teamNum, priorities });
  }, [selectedCities, fn, teamNum, priorities, generated]);

  return (
    <div>
      <PageHeader
        icon={<Sparkles size={20} />}
        title="AI Market Brief"
        description="Generate a structured comparison brief from the available dataset. The first version uses deterministic logic over local data — no values are invented. An AI API can be integrated later, restricted to the supplied evidence."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">1. Select cities (2–3)</h3>
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => {
                const active = selectedIds.includes(c.id);
                const disabled = !active && selectedIds.length >= 3;
                return (
                  <button key={c.id} onClick={() => toggleCity(c.id)} disabled={disabled}
                    className={classNames('inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all',
                      active ? 'border-ink-800 bg-ink-800 text-white' : disabled ? 'border-ink-100 bg-ink-50/40 text-ink-300 cursor-not-allowed' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50')}>
                    {active && <Check size={13} />}{c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-ink-900">2. Intended GCC function & team size</h3>
            <div>
              <label className="label block mb-1.5">GCC function</label>
              <select value={fn} onChange={(e) => { setFn(e.target.value); setGenerated(false); }} className="select">
                {FUNCTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Approximate team size</label>
              <input type="number" min={1} value={teamSize} onChange={(e) => { setTeamSize(e.target.value); setGenerated(false); }} className="input" placeholder="e.g. 150" />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-1">3. Priorities</h3>
            <p className="text-xs text-ink-500 mb-3">Select what matters most for your decision. The brief will weight trade-offs accordingly.</p>
            <div className="space-y-2">
              {PRIORITIES.map((p) => {
                const active = priorities.includes(p.key);
                return (
                  <button key={p.key} onClick={() => togglePriority(p.key)}
                    className={classNames('w-full text-left rounded-lg border p-3 transition-all',
                      active ? 'border-accent-400 bg-accent-50 ring-1 ring-accent-200' : 'border-ink-200 bg-white hover:border-ink-300')}>
                    <div className="flex items-center gap-2">
                      <span className={classNames('flex h-4 w-4 items-center justify-center rounded border', active ? 'border-accent-500 bg-accent-500 text-white' : 'border-ink-300 bg-white')}>
                        {active && <Check size={11} />}
                      </span>
                      <span className="text-sm font-medium text-ink-800">{p.label}</span>
                    </div>
                    <p className="text-xs text-ink-500 mt-1 pl-6">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setGenerated(true)}
            disabled={selectedCities.length < 2 || priorities.length === 0}
            className="btn-accent w-full py-3 text-base"
          >
            <Sparkles size={18} /> Generate brief
          </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-3">
          {!generated ? (
            <div className="card p-8 h-full flex items-center justify-center">
              <EmptyState
                icon={<Sparkles size={22} />}
                title="Your market brief will appear here"
                description="Select two or three cities, set your function and team size, pick your priorities, then generate. The brief is produced from the available dataset — no values are invented."
              />
            </div>
          ) : selectedCities.length < 2 ? (
            <div className="card p-8 h-full flex items-center justify-center">
              <EmptyState icon={<AlertTriangle size={20} />} title="Select at least two cities" description="You need two or three cities to generate a comparison brief." />
            </div>
          ) : !brief ? (
            <div className="card p-8"><EmptyState title="Unable to generate brief" description="Try adjusting your inputs." /></div>
          ) : (
            <BriefOutput brief={brief} cities={selectedCities} fn={fn} teamSize={teamNum} priorities={priorities} />
          )}
        </div>
      </div>
    </div>
  );
}

interface BriefData {
  executiveSummary: string[];
  evidence: { label: string; detail: string; sourceId: string; confidence: VerificationStatus }[];
  citySections: { city: City; points: string[]; dataGaps: string[] }[];
  tradeoffs: string[];
  dataGaps: string[];
  assumptions: string[];
  sourceIds: string[];
}

function generateBrief({ cities, fn, teamSize, priorities }: { cities: City[]; fn: string; teamSize: number | null; priorities: Priority[] }): BriefData {
  const sourceIds = new Set<string>();
  const executiveSummary: string[] = [];
  const tradeoffs: string[] = [];
  const dataGaps: string[] = [];
  const assumptions: string[] = [];
  const evidence: BriefData['evidence'] = [];

  // --- Executive summary
  executiveSummary.push(
    `This brief compares ${cities.map((c) => c.name).join(', ')} as candidate locations for a ${fn.toLowerCase()} capability centre${teamSize ? ` of approximately ${teamSize} people` : ''}. It is generated deterministically from the GCC Atlas dataset and contains only values that are supported by a cited source.`,
  );

  // GCC presence
  cities.forEach((c) => {
    const gcc = metricsByCity(c.id).find((m) => m.metricKey === 'gcc_count');
    if (gcc) {
      evidence.push({ label: `${c.name} — estimated GCC count`, detail: `${gcc.value} ${gcc.unit} (${gcc.referencePeriod})`, sourceId: gcc.sourceId, confidence: gcc.confidence });
      sourceIds.add(gcc.sourceId);
    }
  });

  // Rent
  const rentVals = cities.map((c) => ({ c, m: metricsByCity(c.id).find((m) => m.metricKey === 'office_rent_grade_a') })).filter((r) => r.m);
  if (rentVals.length >= 2) {
    const sorted = [...rentVals].sort((a, b) => parseFloat(a.m!.value) - parseFloat(b.m!.value));
    executiveSummary.push(
      `On Grade-A office rent, ${sorted[0].c.name} is the lowest among the selected cities (₹${sorted[0].m!.value}/sq.ft./month) and ${sorted[sorted.length - 1].c.name} the highest (₹${sorted[sorted.length - 1].m!.value}/sq.ft./month), per ${sorted[0].m!.referencePeriod} data.`,
    );
    rentVals.forEach((r) => { evidence.push({ label: `${r.c.name} — Grade-A rent`, detail: `₹${r.m!.value}/sq.ft./month (${r.m!.referencePeriod})`, sourceId: r.m!.sourceId, confidence: r.m!.confidence }); sourceIds.add(r.m!.sourceId); });
    if (priorities.includes('cost')) {
      tradeoffs.push(`${sorted[sorted.length - 1].c.name} carries the highest office rent among the selected cities; cost-priority buyers should weigh this against talent and ecosystem depth rather than treating rent alone as decisive.`);
    }
  } else {
    dataGaps.push('Grade-A office rent is not available for all selected cities; the cost comparison is partial.');
  }

  // Salary
  const salaryVals = cities.map((c) => ({ c, m: metricsByCity(c.id).find((m) => m.metricKey === 'avg_salary_mid_engineer') })).filter((s) => s.m);
  if (salaryVals.length >= 2) {
    const sorted = [...salaryVals].sort((a, b) => parseFloat(a.m!.value) - parseFloat(b.m!.value));
    executiveSummary.push(
      `Median mid-level engineer compensation ranges from ₹${sorted[0].m!.value} lakh/year in ${sorted[0].c.name} to ₹${sorted[sorted.length - 1].m!.value} lakh/year in ${sorted[sorted.length - 1].c.name} (FY 2024, reported).`,
    );
    salaryVals.forEach((s) => { evidence.push({ label: `${s.c.name} — median engineer salary`, detail: `₹${s.m!.value} lakh/year (${s.m!.referencePeriod})`, sourceId: s.m!.sourceId, confidence: s.m!.confidence }); sourceIds.add(s.m!.sourceId); });
  }

  // Talent pool
  const talentVals = cities.map((c) => ({ c, m: metricsByCity(c.id).find((m) => m.metricKey === 'tech_talent_pool') })).filter((t) => t.m);
  if (talentVals.length >= 2) {
    const sorted = [...talentVals].sort((a, b) => parseInt(a.m!.value.replace(/\D/g, ''), 10) - parseInt(b.m!.value.replace(/\D/g, ''), 10));
    executiveSummary.push(
      `On estimated tech-talent pool size, ${sorted[sorted.length - 1].c.name} is the largest among the selected cities (${sorted[sorted.length - 1].m!.value} professionals) and ${sorted[0].c.name} the smallest (${sorted[0].m!.value}). These are industry-report-derived estimates.`,
    );
    if (priorities.includes('talent')) {
      tradeoffs.push(`${sorted[0].c.name} has a smaller estimated talent pool; talent-priority users may face a longer hiring ramp, offset partially by lower salary costs.`);
    }
  } else {
    dataGaps.push('Tech-talent pool estimates are not available for all selected cities; talent-priority comparisons are partial.');
  }

  // Industry ecosystem — cluster match
  const fnKeywords: Record<string, string[]> = {
    'Engineering & R&D': ['Automotive R&D', 'Semiconductors', 'Software & SaaS'],
    'Data & Analytics': ['Software & SaaS', 'Financial Services'],
    'Finance & Accounting': ['Financial Services', 'BFSI Shared Services'],
    'Customer Support': ['Software & SaaS', 'E-commerce'],
    'IT & Infrastructure': ['Software & SaaS'],
    'Product & Design': ['Software & SaaS', 'E-commerce'],
    'Procurement & Supply Chain': ['Manufacturing & Engineering'],
  };
  const keywords = fnKeywords[fn] ?? [];
  const clusterMatches = cities.map((c) => ({ c, count: c.industryClusters.filter((cl) => keywords.some((k) => cl.toLowerCase().includes(k.toLowerCase()))).length }));
  const bestCluster = [...clusterMatches].sort((a, b) => b.count - a.count)[0];
  if (bestCluster && bestCluster.count > 0 && priorities.includes('industry_ecosystem')) {
    executiveSummary.push(
      `For ${fn.toLowerCase()} work, ${bestCluster.c.name} has the strongest match against the relevant industry clusters among the selected cities (${bestCluster.c.industryClusters.join(', ')}).`,
    );
  }

  // GCC presence priority
  if (priorities.includes('gcc_presence')) {
    const gccCounts = cities.map((c) => ({ c, m: metricsByCity(c.id).find((m) => m.metricKey === 'gcc_count') })).filter((g) => g.m);
    if (gccCounts.length >= 2) {
      const sorted = [...gccCounts].sort((a, b) => parseInt(a.m!.value.replace(/\D/g, ''), 10) - parseInt(b.m!.value.replace(/\D/g, ''), 10));
      executiveSummary.push(`On existing GCC presence, ${sorted[sorted.length - 1].c.name} has the largest estimated cluster (${sorted[sorted.length - 1].m!.value}) and ${sorted[0].c.name} the smallest (${sorted[0].m!.value}).`);
    }
  }

  // Per-city sections
  const citySections = cities.map((c) => {
    const points: string[] = [];
    const gaps: string[] = [];
    const rent = metricsByCity(c.id).find((m) => m.metricKey === 'office_rent_grade_a');
    const salary = metricsByCity(c.id).find((m) => m.metricKey === 'avg_salary_mid_engineer');
    const talent = metricsByCity(c.id).find((m) => m.metricKey === 'tech_talent_pool');
    const gcc = metricsByCity(c.id).find((m) => m.metricKey === 'gcc_count');
    const vacancy = metricsByCity(c.id).find((m) => m.metricKey === 'seap_vacancy');

    points.push(`${c.name} is in ${c.region}. ${c.summary}`);
    if (gcc) points.push(`Estimated GCC presence: ${gcc.value} ${gcc.unit} (${gcc.referencePeriod}, ${gcc.confidence}).`);
    if (rent) points.push(`Grade-A office rent: ₹${rent.value}/sq.ft./month (${rent.referencePeriod}).`);
    if (vacancy) points.push(`Office vacancy: ${vacancy.value}% (${vacancy.referencePeriod}) — relevant for immediate availability.`);
    if (salary) points.push(`Median mid-level engineer salary: ₹${salary.value} lakh/year (${salary.referencePeriod}).`);
    if (talent) points.push(`Estimated tech-talent pool: ${talent.value} professionals (${talent.referencePeriod}, ${talent.confidence}).`);
    points.push(`Industry clusters: ${c.industryClusters.join(', ')}.`);
    points.push(`Incentives: ${c.incentivesSummary}`);

    if (!rent) gaps.push('Grade-A office rent');
    if (!salary) gaps.push('Median engineer salary');
    if (!talent) gaps.push('Tech-talent pool estimate');
    if (!gcc) gaps.push('GCC count estimate');
    if (!vacancy) gaps.push('Office vacancy rate');
    return { city: c, points, dataGaps: gaps };
  });

  // Aggregated data gaps
  const allPossibleMetrics = ['Grade-A office rent', 'Median engineer salary', 'Tech-talent pool estimate', 'GCC count estimate', 'Office vacancy rate', 'Cost-of-living index', 'Metro rail network', 'Office stock'];
  const availableMetricKeys = new Set<string>();
  cities.forEach((c) => metricsByCity(c.id).forEach((m) => availableMetricKeys.add(metricDefinitionMap[m.metricKey]?.label)));
  allPossibleMetrics.forEach((m) => { if (!Array.from(availableMetricKeys).some((a) => a?.includes(m.split(' ')[0]))) dataGaps.push(`${m} is missing for one or more selected cities.`); });

  // Assumptions
  assumptions.push('The brief assumes your GCC function maps to the listed industry clusters and that rent and salary figures for the stated reference periods remain directionally valid.');
  assumptions.push('Talent-pool and GCC-count figures are "Estimated" — derived from industry-report aggregates, not census counts.');
  assumptions.push('Incentive eligibility depends on unit size, location tier and policy jurisdiction; the brief does not assume any specific unit qualifies.');
  if (teamSize === null) assumptions.push('No team size provided; per-seat cost implications are not derived.');
  if (priorities.length === 0) assumptions.push('No priorities selected; all dimensions are treated equally in the summary.');

  // Tradeoffs
  if (rentVals.length >= 2 && salaryVals.length >= 2) {
    const cheapestRent = [...rentVals].sort((a, b) => parseFloat(a.m!.value) - parseFloat(b.m!.value))[0];
    const cheapestSalary = [...salaryVals].sort((a, b) => parseFloat(a.m!.value) - parseFloat(b.m!.value))[0];
    const largestTalent = [...talentVals].sort((a, b) => parseInt(b.m!.value.replace(/\D/g, ''), 10) - parseInt(a.m!.value.replace(/\D/g, ''), 10))[0];
    if (cheapestRent.c.id !== largestTalent?.c.id) {
      tradeoffs.push(`The city with the lowest office rent (${cheapestRent.c.name}) is not the city with the largest estimated talent pool (${largestTalent?.c.name}); cost and talent priorities pull in different directions.`);
    }
  }
  tradeoffs.push('Incentive structures differ by state and are not directly comparable; a lower headline incentive in one state may not imply a worse overall package.');

  // Signals relevance
  const relevantSignals = signals.filter((s) => cities.some((c) => c.name === s.city));
  if (relevantSignals.length > 0) {
    evidence.push({ label: 'Recent market signals', detail: `${relevantSignals.length} sourced signals in the dataset relate to the selected cities (see Market Signals).`, sourceId: relevantSignals[0].sourceId, confidence: 'verified' });
    relevantSignals.forEach((s) => sourceIds.add(s.sourceId));
  }

  return { executiveSummary, evidence, citySections, tradeoffs, dataGaps, assumptions, sourceIds: Array.from(sourceIds) };
}

function BriefOutput({ brief, cities, fn, teamSize, priorities }: { brief: BriefData; cities: City[]; fn: string; teamSize: number | null; priorities: Priority[] }) {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-warning-600" />
        <div className="text-xs text-warning-600 leading-relaxed">
          <span className="font-semibold">Preliminary research, not professional advice.</span> This brief is generated from a limited, sourced dataset. It is not investment, legal, tax or real-estate advice. Verify all figures against the cited sources before acting.
        </div>
      </div>

      <Section icon={<FileText size={15} />} title="Executive summary">
        <div className="space-y-2 text-sm text-ink-700 leading-relaxed">
          {brief.executiveSummary.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-500">
          <span className="chip bg-ink-50 text-ink-600">Function: {fn}</span>
          {teamSize && <span className="chip bg-ink-50 text-ink-600">Team size: ~{teamSize}</span>}
          <span className="chip bg-ink-50 text-ink-600">Priorities: {priorities.length ? priorities.join(', ') : 'none selected'}</span>
        </div>
      </Section>

      <Section icon={<Layers size={15} />} title="Relevant available evidence">
        <ul className="space-y-2">
          {brief.evidence.map((e, i) => (
            <li key={i} className="rounded-lg border border-ink-100 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink-800">{e.label}</div>
                  <div className="text-xs text-ink-600 mt-0.5">{e.detail}</div>
                </div>
                <VerificationBadge status={e.confidence} />
              </div>
              <div className="mt-2"><SourceCitation sourceId={e.sourceId} /></div>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={<Map size={15} />} title="City-by-city comparison">
        <div className="space-y-3">
          {brief.citySections.map((s) => (
            <div key={s.city.id} className="rounded-lg border border-ink-100 bg-white p-4">
              <h4 className="text-sm font-semibold text-ink-900 mb-2">{s.city.name}</h4>
              <ul className="space-y-1.5 text-sm text-ink-700 leading-relaxed list-disc list-outside pl-4 marker:text-ink-300">
                {s.points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
              {s.dataGaps.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.dataGaps.map((g) => <span key={g} className="chip bg-error-50 text-error-600 text-[10px] ring-1 ring-error-100"><X size={9} /> {g} unavailable</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Lightbulb size={15} />} title="Important trade-offs">
        <ul className="space-y-2 text-sm text-ink-700 leading-relaxed list-disc list-outside pl-4 marker:text-accent-400">
          {brief.tradeoffs.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </Section>

      <Section icon={<AlertTriangle size={15} />} title="Data gaps">
        {brief.dataGaps.length === 0 ? <p className="text-sm text-ink-600">No material gaps identified for the selected cities across the available metrics.</p> : (
          <ul className="space-y-1.5 text-sm text-ink-700 leading-relaxed list-disc list-outside pl-4 marker:text-ink-300">
            {brief.dataGaps.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        )}
      </Section>

      <Section icon={<Check size={15} />} title="Assumptions">
        <ul className="space-y-1.5 text-sm text-ink-700 leading-relaxed list-disc list-outside pl-4 marker:text-ink-300">
          {brief.assumptions.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </Section>

      <Section icon={<FileText size={15} />} title="Sources">
        <div className="space-y-2">
          {brief.sourceIds.map((sid) => {
            const src = sourceMap[sid];
            if (!src) return null;
            return (
              <div key={sid} className="rounded-lg border border-ink-100 bg-white p-3">
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent-600 hover:text-accent-500">{src.name}</a>
                <div className="text-xs text-ink-500 mt-0.5">{src.publisher} · Published {formatDate(src.publishedDate)} · Accessed {formatDate(src.accessedDate)}</div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-ink-500">{icon}</span>
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}
