'''
import { IntersectionObserver } from './IntersectionObserver';
import { useState, useEffect, memo } from 'react';
import { persona, personaLocales } from '../content/persona';
import type { PersonaKey } from '../content/persona';
import matter from 'gray-matter';

interface LogEntryItem {
  id: number;
  date: string;
  title: string;
  content: string;
  tags: string[];
  pillar: PersonaKey;
}

// Use Vite's import.meta.glob to import all markdown files as raw text
const modulesEn = import.meta.glob('/src/content/logs/en/*.md', { eager: true, as: 'raw' });
const modulesId = import.meta.glob('/src/content/logs/id/*.md', { eager: true, as: 'raw' });

const parseLogEntries = (modules: Record<string, string>): LogEntryItem[] => {
  const logEntries = Object.values(modules).map((rawContent) => {
    const { data, content } = matter(rawContent);
    return {
      id: data.id,
      date: data.date,
      title: data.title,
      content: content.trim(),
      tags: data.tags,
      pillar: data.pillar,
    };
  });
  // Sort entries by date descending
  return logEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Pre-parse the logs for both languages
const allLogEntries = {
  en: parseLogEntries(modulesEn),
  id: parseLogEntries(modulesId),
};

function LogBookSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const logbookCopyEn = personaLocales.en;
  const logbookCopyId = personaLocales.id;
  const logbookPillarsId = 'logbook-pillars';
  const logbookMissionId = 'logbook-mission';
  const logbookHeadingId = 'logbook-heading';

  const [logEntries, setLogEntries] = useState<LogEntryItem[]>([]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setCardsLoaded(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const locale = (document.documentElement.lang as 'en' | 'id') || 'en';
      setLogEntries(allLogEntries[locale]);
    }
  }, [isVisible]);

  const FloatingAccent = ({ className, delay = 0 }: { className: string; delay?: number }) => (
    <div
      className={`absolute w-1 h-1 bg-gradient-to-r from-pink-400/40 to-purple-400/40 rounded-full animate-pulse ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );

  return (
    <IntersectionObserver
      className="home-logs lazy-section relative py-20 lg:py-32 overflow-hidden"
      data-intrinsic="log"
      onIntersect={() => setIsVisible(true)}
    >
      <section
        id="log-book"
        className="padding-global"
        role="region"
        aria-labelledby={logbookHeadingId}
        aria-describedby={logbookMissionId}
        data-semantic-tags={persona.pillars.flatMap(pillar => pillar.semanticTags).join(' ')}
      >
        <div className="container-xlarge space-y-16">
          <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p
              id={logbookPillarsId}
              className="uppercase tracking-[0.3em] text-xs sm:text-sm text-white/50 mb-4"
              lang="en"
            >
              {persona.pillars.map(pillar => pillar.short).join(' • ')}
            </p>
            <span className="sr-only" lang="id">
              {Object.values(logbookCopyId.pillars).map(pillar => pillar.short).join(' • ')}
            </span>
            <h2
              id={logbookHeadingId}
              className="text-3xl sm:text-4xl font-semibold text-white mb-6"
              lang="en"
            >
              Logbook of mindful progress
            </h2>
            <span className="sr-only" lang="id">
              Buku catatan kemajuan penuh kesadaran
            </span>
            <p
              id={logbookMissionId}
              className="text-base sm:text-lg text-white/70 leading-relaxed"
              lang="en"
            >
              {logbookCopyEn.mission}
            </p>
            <span className="sr-only" lang="id">
              {logbookCopyId.mission}
            </span>
          </div>

          <div className={`grid gap-6 sm:gap-8 lg:grid-cols-3 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700`}
            aria-label="Zenotika persona pillars">
            {persona.pillars.map((pillar, index) => (
              <article
                key={pillar.key}
                className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 text-left space-y-4 transition-all duration-700"
                style={{ transitionDelay: `${index * 0.1}s` }}
                data-pillar={pillar.key}
                data-semantic-tags={pillar.semanticTags.join(' ')}
                aria-label={`${pillar.title} pillar insight`}
              >
                <header className="space-y-2">
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">
                    Persona pillar
                  </p>
                  <h3 className="text-xl text-white">{pillar.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{pillar.description}</p>
                </header>
                <div className="flex flex-wrap gap-2" aria-label={`${pillar.title} semantic tags`}>
                  {pillar.semanticTags.map(tag => (
                    <span
                      key={tag}
                      className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3" role="list">
            {logEntries.map((entry, index) => (
              <LogEntry
                key={entry.id}
                entry={entry}
                index={index}
                isVisible={isVisible && cardsLoaded}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Zenotika Enhanced Background - Zen + Nova + Informatika */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Zen Layer: Calm, Mindful Starfield */}
        <div className="stars-overlay logbook-stars absolute inset-0 opacity-30"></div>

        {/* Nova Layer: Modern Energy Gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-1/5 left-1/5 w-40 h-40 bg-gradient-to-br from-pink-500/6 to-purple-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-1/4 right-1/5 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-gradient-to-br from-purple-500/4 to-pink-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
          <div className="absolute top-3/4 left-1/3 w-36 h-36 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '9s' }}></div>
        </div>

        {/* Informatika Layer: Efficient, Geometric Accents */}
        <div className="absolute inset-0">
          <FloatingAccent className="top-12 left-12" delay={0} />
          <FloatingAccent className="top-24 right-24" delay={2} />
          <FloatingAccent className="bottom-24 left-24" delay={4} />
          <FloatingAccent className="bottom-12 right-12" delay={6} />
          <FloatingAccent className="top-1/3 left-1/2" delay={8} />
          <FloatingAccent className="bottom-1/3 right-1/2" delay={10} />
        </div>

        {/* Zenotika Unity: Subtle Connecting Lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
            <defs>
              <linearGradient id="zenotika-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-brand-pink-hot)" stopOpacity="0.1" />
                <stop offset="50%" stopColor="var(--color-brand-violet)" stopOpacity="0.05" />
                <stop offset="100%" stopColor="var(--color-brand-blue)" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path d="M0,400 Q360,200 720,300 T1440,250" stroke="url(#zenotika-gradient)" strokeWidth="1" fill="none" className="animate-pulse" />
            <path d="M0,500 Q360,300 720,400 T1440,350" stroke="url(#zenotika-gradient)" strokeWidth="0.5" fill="none" className="animate-pulse" style={{ animationDelay: '2s' }} />
          </svg>
        </div>
      </div>
    </IntersectionObserver>
  );
}

// Optimized Log Entry Component
const LogEntry = memo(function LogEntry({
  entry,
  index,
  isVisible
}: {
  entry: LogEntryItem;
  index: number;
  isVisible: boolean;
}) {
  const pillar = persona.pillars.find(p => p.key === entry.pillar);
  const tagsId = `log-entry-${entry.id}-tags`;
  return (
    <div
      className={`log-card bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      style={{ transitionDelay: `${index * 0.2}s` }}
      data-pillar={entry.pillar}
      data-semantic-tags={pillar?.semanticTags.join(' ')}
      aria-label={`${entry.title} — ${pillar?.short ?? ''}`.trim()}
      role="listitem"
      aria-describedby={pillar ? tagsId : undefined}
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
        <div className="log-date text-sm text-pink-400 font-mono bg-pink-400/10 px-3 py-1 rounded-full w-fit">
          {entry.date}
        </div>

        <div className="flex-1">
          {pillar && (
            <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2">
              {pillar.short}
            </p>
          )}
          <h3 className="log-title text-lg lg:text-xl text-white mb-3">{entry.title}</h3>
          <p className="log-content text-white/70 leading-relaxed mb-4">{entry.content}</p>

          <div
            id={tagsId}
            className="log-tags flex flex-wrap gap-2"
            aria-label="Associated themes"
          >
            {entry.tags.map((tag: string, tagIndex: number) => (
              <span
                key={tagIndex}
                className="tag bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default memo(LogBookSection);
'''