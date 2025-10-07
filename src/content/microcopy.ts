// Centralized microcopy & system voice dictionary (OPP-8.3, 8.10, 8.12, 8.15)
// Provides consistent pseudo-terminal voice while maintaining accessible plain variants.
// Each entry can expose: key, system (decorative/terminal), plain (accessible), a11y (override for screen readers).

export interface MicrocopyEntry {
  key: string;
  system: string;       // stylized text (may include prefixes like SYS>)
  plain?: string;       // human readable neutral variant
  a11y?: string;        // specific aria-live alternative if needed
  description?: string; // internal note
}

// Keys enumerated for reuse across components.
export const MICROCOPY: Record<string, MicrocopyEntry> = {
  progressStatusTemplate: {
    key: 'progressStatusTemplate',
    system: 'SYS> EXP {visited}/{totalSec} | REL {collected}/{totalCol} | CORE {completion}%',
    plain: 'Exploration {visited}/{totalSec} · Relics {collected}/{totalCol} · System {completion}%',
    description: 'Header unified progress status line templates (placeholders in braces).'
  },
  progressA11yTemplate: {
    key: 'progressA11yTemplate',
    system: 'Unified progress {completion}% (exploration {visited}/{totalSec}, relics {collected}/{totalCol})',
    plain: 'Unified progress {completion}% (exploration {visited} of {totalSec}, relics {collected} of {totalCol})',
    a11y: 'Unified progress {completion} complete: exploration {visited} of {totalSec}, relics {collected} of {totalCol}.',
    description: 'Simplified aria-live friendly unified progress announcement.'
  },
  newsletterSuccess: {
    key: 'newsletterSuccess',
    system: 'SYS> Subscription registered. A curated stream of playful dispatches is now queued.',
    plain: 'Subscribed successfully. You will receive updates.',
    description: 'Newsletter success feedback.'
  },
  newsletterError: {
    key: 'newsletterError',
    system: 'SYS> Address invalid. Provide a valid email so the dispatch relay can lock on.',
    plain: 'Invalid email address. Please correct it.',
    description: 'Newsletter invalid email message.'
  },
  newsletterIdleCta: {
    key: 'newsletterIdleCta',
    system: 'Sign up',
    plain: 'Sign up'
  },
  newsletterRetryCta: {
    key: 'newsletterRetryCta',
    system: 'Retry',
    plain: 'Retry'
  },
  newsletterEnlistedCta: {
    key: 'newsletterEnlistedCta',
    system: 'Enlisted',
    plain: 'Subscribed'
  },
  milestone25: {
    key: 'milestone25',
    system: 'SYS> Quarter systems mapped.',
    plain: '25 percent progress reached.'
  },
  milestone50: {
    key: 'milestone50',
    system: 'SYS> Halfway core mapping achieved.',
    plain: '50 percent progress reached.'
  },
  milestone75: {
    key: 'milestone75',
    system: 'SYS> Critical mass near. 75%.',
    plain: '75 percent progress reached.'
  },
  milestone100: {
    key: 'milestone100',
    system: 'SYS> Full spectrum complete. 100%.',
    plain: 'Progress complete.'
  }
};

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export interface ProgressVoiceParams {
  visited: number; totalSec: number; collected: number; totalCol: number; completion: number;
  system?: boolean;
}

export function renderProgressVoice(p: ProgressVoiceParams): string {
  const entry = MICROCOPY.progressStatusTemplate;
  const map = {
    visited: p.visited.toString().padStart(2,'0'),
    totalSec: p.totalSec.toString().padStart(2,'0'),
    collected: p.collected.toString().padStart(2,'0'),
    totalCol: p.totalCol.toString().padStart(2,'0'),
    completion: `${p.completion}%`
  };
  return interpolate(p.system ? entry.system : (entry.plain || entry.system), map);
}
