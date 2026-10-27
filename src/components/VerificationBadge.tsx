import type { VerificationStatus } from '@/types';
import { verificationLabels, verificationStyles, verificationDot, classNames } from '@/lib/format';

interface Props {
  status: VerificationStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export function VerificationBadge({ status, size = 'sm', showDot = true, className }: Props) {
  const sizeCls = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span
      className={classNames('chip ring-inset', verificationStyles[status], sizeCls, className)}
      title={verificationLabels[status]}
    >
      {showDot && <span className={classNames('h-1.5 w-1.5 rounded-full', verificationDot[status])} />}
      {verificationLabels[status]}
    </span>
  );
}
