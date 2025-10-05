import { describe, it, expect } from 'vitest';
import { createRoot } from 'react-dom/client';
import React, { act } from 'react';
import App from '../App';

// Ensure performanceMetrics flag false here so badge logic harmless

describe('MetaManager runtime injection', () => {
  it('injects description & keywords metas', async () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    await act(async () => {
      createRoot(div).render(<App />);
      // Wait a bit for effect inside MetaManager
      await new Promise(r => setTimeout(r, 30));
    });

    const desc = document.head.querySelector('meta[name="description"]');
    const kw = document.head.querySelector('meta[name="keywords"]');
    const og = document.head.querySelector('meta[property="og:title"]');
    expect(desc).toBeTruthy();
    expect(kw).toBeTruthy();
    expect(og).toBeTruthy();
    const snapshot = {
      description: desc?.getAttribute('content'),
      keywords: kw?.getAttribute('content')?.split(',').slice(0,3),
      ogTitle: og?.getAttribute('content'),
      locale: (window as any).__ZENOTIKA_META?.locale
    };
    expect(snapshot.description?.toLowerCase()).toContain('zenotika');
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "description": "Zenotika – React 19 progressive web experience berfokus pada performa, aksesibilitas, dan desain berniat baik.",
        "keywords": [
          "zenotika",
          " react 19",
          " performance",
        ],
        "locale": "en",
        "ogTitle": "Zenotika",
      }
    `);
  });
});
