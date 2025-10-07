import { useEffect } from 'react';
import { buildMeta, defaultMeta } from '@/content/meta';
import { metaID } from '@/content/meta.id';

// Simple utility to safely append/replace a JSON-LD script element by id
function upsertJsonLd(id: string, data: Record<string, any>) {
  const json = JSON.stringify(data, null, 2);
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  // Only touch DOM if content changed (avoid layout thrash & keep mutation observers calm)
  if (el.textContent !== json) {
    el.textContent = json;
  }
}

export function StructuredData() {
  useEffect(() => {
    try {
      // Determine active locale & meta (mirrors logic in MetaManager)
      const stored = localStorage.getItem('zenotikaLocale');
      const auto = (navigator?.language || 'en').toLowerCase().startsWith('id') ? 'id' : 'en';
      const effectiveLocale = stored === 'en' || stored === 'id' ? stored : auto;
      const selected = effectiveLocale === 'id' ? metaID : defaultMeta;
      const meta = buildMeta({
        title: selected.title,
        description: selected.description,
        keywords: selected.keywords,
        canonical: selected.canonical,
      });
      const canonical = meta.canonical;
      const now = new Date().toISOString();

      // 1. Organization
      upsertJsonLd('ld-org', {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: meta.title,
        url: canonical,
        description: meta.description,
        logo: canonical + 'share.png',
        sameAs: [
          canonical,
        ],
      });

      // 2. WebSite + potential SearchAction (placeholder)
      upsertJsonLd('ld-website', {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: meta.title,
        url: canonical,
        inLanguage: effectiveLocale,
        potentialAction: {
          '@type': 'SearchAction',
          target: canonical + '?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      });

      // 3. SoftwareApplication (optional representation of the PWA)
      upsertJsonLd('ld-app', {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: meta.title,
        applicationCategory: 'WebApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: canonical,
      });

      // 4. BreadcrumbList (basic: landing -> home) if hash indicates home
      const isHome = window.location.hash.includes('home');
      upsertJsonLd('ld-breadcrumbs', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Landing',
            item: canonical,
          },
          ...(isHome
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Home',
                  item: canonical + '#home',
                },
              ]
            : []),
        ],
      });

      // 5. WebPage (contextual page descriptor)
      upsertJsonLd('ld-webpage', {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        url: canonical + (isHome ? '#home' : ''),
        description: meta.description,
        dateModified: now,
        inLanguage: effectiveLocale,
        isPartOf: { '@id': canonical },
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[StructuredData] injection failed', error);
      }
    }
  }, []);
  return null;
}

export default StructuredData;
