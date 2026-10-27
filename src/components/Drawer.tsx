import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { classNames } from '@/lib/format';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'md' | 'lg';
}

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'lg' }: DrawerProps) {
  const [rendered, setRendered] = useState(open);

  // Keep mounted briefly on close for exit animation
  if (open && !rendered) setRendered(true);

  return (
    <div
      className={classNames('fixed inset-0 z-50', rendered ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        className={classNames(
          'absolute inset-0 bg-ink-900/30 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        onTransitionEnd={() => !open && setRendered(false)}
      />
      <aside
        className={classNames(
          'absolute right-0 top-0 h-full bg-white shadow-pop border-l border-ink-100 flex flex-col transition-transform duration-300 ease-out',
          width === 'lg' ? 'w-full sm:max-w-xl md:max-w-2xl' : 'w-full sm:max-w-md',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
          <div className="min-w-0">
            <div className="text-base font-semibold text-ink-900 leading-snug">{title}</div>
            {subtitle && <div className="mt-1 text-sm text-ink-500">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="btn-ghost -mr-2 -mt-1 p-2 rounded-lg" aria-label="Close panel">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">{children}</div>
        {footer && <footer className="border-t border-ink-100 px-6 py-4 bg-canvas-subtle">{footer}</footer>}
      </aside>
    </div>
  );
}
