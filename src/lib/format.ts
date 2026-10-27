import type { VerificationStatus } from '@/types';

export const verificationLabels: Record<VerificationStatus, string> = {
  verified: 'Verified',
  reported: 'Reported',
  estimated: 'Estimated',
  needs_verification: 'Needs verification',
};

export const verificationDescriptions: Record<VerificationStatus, string> = {
  verified: 'Directly supported by a reliable source that has been checked.',
  reported: 'Published by a credible third party but not independently confirmed.',
  estimated: 'Derived from explicitly stated assumptions or calculations.',
  needs_verification: 'Insufficient evidence for a definitive claim.',
};

export const verificationStyles: Record<VerificationStatus, string> = {
  verified: 'bg-success-100 text-success-600 ring-1 ring-success-100',
  reported: 'bg-accent-100 text-accent-600 ring-1 ring-accent-100',
  estimated: 'bg-warning-100 text-warning-600 ring-1 ring-warning-100',
  needs_verification: 'bg-error-100 text-error-600 ring-1 ring-error-100',
};

export const verificationDot: Record<VerificationStatus, string> = {
  verified: 'bg-success-500',
  reported: 'bg-accent-500',
  estimated: 'bg-warning-500',
  needs_verification: 'bg-error-500',
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
