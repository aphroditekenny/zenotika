import { memo, forwardRef } from 'react';

interface ActiveSectionLinkProps {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}

// Minimal component to centralize active link styling logic.
export const ActiveSectionLink = memo(forwardRef<HTMLAnchorElement, ActiveSectionLinkProps>(
  function ActiveSectionLink({ href, label, active, onClick }: ActiveSectionLinkProps, ref) {
    return (
      <a
        ref={ref}
        href={href}
        onClick={onClick}
        data-active={active || undefined}
        className={
          'zen-nav-link inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors ' +
          (active
            ? 'bg-white/20 text-white backdrop-blur border border-white/40 shadow-sm'
            : 'text-white/60 hover:text-white hover:bg-white/10')
        }
        aria-current={active ? 'page' : undefined}
      >
        {label}
        {active && (
          <span
            aria-hidden="true"
            className="inline-block h-1 w-1 rounded-full bg-gradient-to-r from-pink-400 via-violet-400 to-indigo-400 animate-pulse"
          />
        )}
      </a>
    );
  }
));

export default ActiveSectionLink;
