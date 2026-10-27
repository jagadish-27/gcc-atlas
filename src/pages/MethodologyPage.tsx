import { BookOpen, ShieldCheck, AlertTriangle, FileText, ExternalLink, Mail, Info, CheckCircle2, HelpCircle, Database } from 'lucide-react';
import { sources, companies, signals, cities } from '@/data';
import type { VerificationStatus } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { PageHeader } from '@/components/ui';
import { verificationLabels, verificationDescriptions, formatDate, uniqueSorted } from '@/lib/format';

export function MethodologyPage() {
  const sourceList = [...sources].sort((a, b) => a.publisher.localeCompare(b.publisher));
  const companyDates = companies.map((c) => c.lastVerifiedDate);
  const signalDates = signals.map((s) => s.publicationDate);
  const allDates = [...companyDates, ...signalDates].sort();
  const earliest = allDates[0];
  const latest = allDates.slice(-1)[0];

  return (
    <div>
      <PageHeader
        icon={<BookOpen size={20} />}
        title="Data Methodology"
        description="How GCC Atlas classifies records, attributes sources, distinguishes confirmed facts from estimates, and handles data gaps. Every sourced claim in this tool is traceable to a publication listed below."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section icon={<Database size={16} />} title="How company records are classified">
            <p className="text-sm text-ink-700 leading-relaxed">
              A record is included in the GCC Directory only when a published source supports that the company maintains an India-based capability centre serving its parent (or a closely held group) — not merely that it has an Indian office.
            </p>
            <p className="text-sm text-ink-700 leading-relaxed mt-2">
              Where a multinational has a real Indian office but the source does not clearly establish it as a GCC (internal capability centre rather than a client-facing delivery centre or sales office), the record is included but flagged <strong>"Needs verification"</strong>. This keeps the dataset honest: we do not treat every Indian office of a multinational as a confirmed GCC.
            </p>
            <p className="text-sm text-ink-700 leading-relaxed mt-2">
              IT-services firms (TCS, Mphasis, Capgemini) are included where they operate internal shared-services or R&D capability for their own group; their client-facing delivery centres are not classified as GCCs.
            </p>
          </Section>

          <Section icon={<FileText size={16} />} title="How sources are attributed">
            <p className="text-sm text-ink-700 leading-relaxed">
              Every sourced claim — a company record, a city metric, a market signal — points to exactly one <strong>source record</strong>. Each source stores its name, publisher, URL, publication date, the date it was last accessed, and its type (news, company announcement, government policy, industry report or press release).
            </p>
            <p className="text-sm text-ink-700 leading-relaxed mt-2">
              Source links open the original publication so you can verify the claim yourself. The dataset is intentionally small precisely so that each claim can be checked against its source.
            </p>
          </Section>

          <Section icon={<ShieldCheck size={16} />} title="Verified facts vs. estimates">
            <p className="text-sm text-ink-700 leading-relaxed">
              We draw a hard line between facts that a source directly states and values derived by us from stated assumptions:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-ink-700 leading-relaxed list-disc list-outside pl-4 marker:text-ink-300">
              <li><strong>Verified</strong> — the source directly states the fact (e.g. "Microsoft opened a new IDC campus in Bengaluru on date X").</li>
              <li><strong>Estimated</strong> — we derived the value from stated assumptions. For example, city GCC counts are derived from NASSCOM-Zinnov aggregate India figures and city-share estimates, so they are labelled "Estimated", not "Verified".</li>
              <li><strong>Reported</strong> — a credible third party has published the claim, but we have not independently confirmed it beyond that publication.</li>
            </ul>
            <p className="text-sm text-ink-700 leading-relaxed mt-3">
              We never label a record "Verified" unless its supporting evidence has actually been checked.
            </p>
          </Section>

          <Section icon={<CheckCircle2 size={16} />} title="What the verification statuses mean">
            <div className="space-y-3">
              {(['verified', 'reported', 'estimated', 'needs_verification'] as VerificationStatus[]).map((s) => (
                <div key={s} className="flex items-start gap-3 rounded-lg border border-ink-100 bg-white p-3">
                  <VerificationBadge status={s} size="md" />
                  <p className="text-sm text-ink-600 leading-relaxed flex-1">{verificationDescriptions[s]}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<HelpCircle size={16} />} title="When each record was last checked">
            <p className="text-sm text-ink-700 leading-relaxed">
              Every company record carries a <strong>last-verified date</strong> — the date the source was last consulted for this dataset. Every source also carries a separate <strong>accessed date</strong> for the underlying publication.
            </p>
            <p className="text-sm text-ink-700 leading-relaxed mt-2">
              In this prototype, the most recent last-verified date across company and signal records is <strong>{formatDate(latest)}</strong>. Records should be re-checked periodically; sources may be updated or removed by their publishers over time.
            </p>
          </Section>

          <Section icon={<AlertTriangle size={16} />} title="Known coverage gaps">
            <ul className="space-y-2 text-sm text-ink-700 leading-relaxed list-disc list-outside pl-4 marker:text-ink-300">
              <li>The dataset covers {companies.length} company records across {uniqueSorted(companies.map((c) => c.city)).length} cities. India has an estimated 1,700+ GCCs (NASSCOM-Zinnov); this prototype is intentionally not exhaustive.</li>
              <li>City metrics are available for {cities.length} cities but not every metric is populated for every city. Missing cells are shown as "Data unavailable", not filled with invented values.</li>
              <li>Several records are flagged "Needs verification" because the source establishes an Indian office but not clearly a GCC; these are kept distinct from confirmed GCCs.</li>
              <li>{"Cost-of-living index values are crowd-sourced (Numbeo) and labelled 'Estimated'; treat as directional, not precise."}</li>
              <li>Engineering-graduate counts are at state level, not city level, and are flagged as not directly comparable across cities.</li>
              <li>Incentive structures differ by state and policy period; cross-state comparison should account for differing eligibility and caps.</li>
            </ul>
          </Section>

          <Section icon={<Mail size={16} />} title="How to report incorrect information">
            <p className="text-sm text-ink-700 leading-relaxed">
              If you spot an error, an outdated figure or a record that should be re-classified, please report it with the supporting source. Include:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-700 leading-relaxed list-disc list-outside pl-4 marker:text-ink-300">
              <li>The record name or city-metric identifier.</li>
              <li>The specific claim you believe is incorrect.</li>
              <li>A link to the source that supports the correction.</li>
            </ul>
            <p className="text-sm text-ink-700 leading-relaxed mt-2">
              Email corrections to <a href="mailto:atlas-corrections@example.org" className="link">atlas-corrections@example.org</a> with the subject line "GCC Atlas correction". Reports are reviewed and reflected in the dataset with an updated last-verified date.
            </p>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} className="text-ink-500" />
              <h3 className="text-sm font-semibold text-ink-900">At a glance</h3>
            </div>
            <dl className="space-y-3 text-sm">
              <div><dt className="label">Sources referenced</dt><dd className="mt-1 font-semibold text-ink-900">{sources.length}</dd></div>
              <div><dt className="label">Company records</dt><dd className="mt-1 font-semibold text-ink-900">{companies.length}</dd></div>
              <div><dt className="label">Market signals</dt><dd className="mt-1 font-semibold text-ink-900">{signals.length}</dd></div>
              <div><dt className="label">Cities covered</dt><dd className="mt-1 font-semibold text-ink-900">{cities.length}</dd></div>
            </dl>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} className="text-accent-600" />
              <h3 className="text-sm font-semibold text-ink-900">Classification rules</h3>
            </div>
            <ul className="space-y-2 text-xs text-ink-600 leading-relaxed list-disc list-outside pl-4 marker:text-ink-300">
              <li>Confirmed GCC: source supports internal capability centre for the parent group.</li>
              <li>Needs verification: source supports an Indian office but not clearly a GCC.</li>
              <li>IT-services client delivery is not classified as a GCC.</li>
              <li>Estimated values are always labelled as such, never as Verified.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Full source list */}
      <div className="card p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-ink-500" />
          <h2 className="text-sm font-semibold text-ink-900">All sources referenced</h2>
          <span className="text-xs text-ink-400">({sources.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sourceList.map((s) => (
            <div key={s.id} className="rounded-lg border border-ink-100 bg-white p-3.5">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent-600 hover:text-accent-500 inline-flex items-start gap-1">
                <span>{s.name}</span>
                <ExternalLink size={11} className="mt-1 shrink-0 text-ink-400" />
              </a>
              <div className="mt-1.5 text-xs text-ink-500 space-y-0.5">
                <div>{s.publisher}</div>
                <div>Published {formatDate(s.publishedDate)} · Accessed {formatDate(s.accessedDate)}</div>
                <div className="capitalize">{s.type.replace('-', ' ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-ink-500">{icon}</span>
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
