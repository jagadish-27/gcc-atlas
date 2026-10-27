import type { VerificationStatus } from '@/types';

export const verificationLabels: Record<VerificationStatus, string> = {
  verified: 'Verified',
  source_reported: 'Source-reported',
  reported: 'Reported',
  estimated: 'Estimated',
  needs_verification: 'Needs verification',
  conflicting_evidence: 'Conflicting evidence',
};

export const verificationDescriptions: Record<VerificationStatus, string> = {
  verified: 'The specific claim has been checked against appropriate supporting evidence.',
  source_reported: 'A source reports the claim, but independent verification is incomplete.',
  reported: 'Published by a credible third party but not independently confirmed.',
  estimated: 'The value is an estimate, with its methodology or limitation explained.',
  needs_verification: 'Sufficient evidence is not available for a definitive claim.',
  conflicting_evidence: 'Credible sources disagree on this claim.',
};

export const verificationStyles: Record<VerificationStatus, string> = {
  verified: 'bg-success-100 text-success-600 ring-1 ring-success-100',
  source_reported: 'bg-accent-100 text-accent-600 ring-1 ring-accent-100',
  reported: 'bg-accent-100 text-accent-600 ring-1 ring-accent-100',
  estimated: 'bg-warning-100 text-warning-600 ring-1 ring-warning-100',
  needs_verification: 'bg-error-100 text-error-600 ring-1 ring-error-100',
  conflicting_evidence: 'bg-error-100 text-error-600 ring-1 ring-error-100',
};

export const verificationDot: Record<VerificationStatus, string> = {
  verified: 'bg-success-500',
  source_reported: 'bg-accent-500',
  reported: 'bg-accent-500',
  estimated: 'bg-warning-500',
  needs_verification: 'bg-error-500',
  conflicting_evidence: 'bg-error-500',
};

export const incentiveStatusLabels: Record<string, string> = {
  active: 'Active policy',
  historical: 'Historical policy',
  announced_unconfirmed: 'Announced — implementation unconfirmed',
  eligibility_unclear: 'Eligibility or applicability unclear',
  needs_verification: 'Needs verification',
};

export const incentiveStatusStyles: Record<string, string> = {
  active: 'bg-success-100 text-success-600 ring-1 ring-success-100',
  historical: 'bg-ink-100 text-ink-600 ring-1 ring-ink-100',
  announced_unconfirmed: 'bg-warning-100 text-warning-600 ring-1 ring-warning-100',
  eligibility_unclear: 'bg-warning-100 text-warning-600 ring-1 ring-warning-100',
  needs_verification: 'bg-error-100 text-error-600 ring-1 ring-error-100',
};

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatYear(iso: string): string {
  if (!iso) return '—';
  return iso.slice(0, 4);
}

export function classNames(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(' ');
}

export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

// Data freshness indicator — returns a label and color based on how old a date is
export function freshness(date: string): { label: string; color: string } {
  if (!date) return { label: 'Unknown', color: 'text-ink-400' };
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return { label: 'Unknown', color: 'text-ink-400' };
  const months = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months <= 6) return { label: 'Recent (within 6 months)', color: 'text-success-600' };
  if (months <= 18) return { label: 'Moderate (6–18 months)', color: 'text-warning-600' };
  return { label: 'Stale (18+ months)', color: 'text-error-600' };
}
