import { beforeEach, describe, expect, it } from 'vitest';
import { GA_ID, isAnalyticsExcluded, startAnalytics } from './analytics';

const FLAG = `ga-disable-${GA_ID}`;
const flags = window as unknown as Record<string, unknown>;
const scripts = () => document.head.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').length;

describe('analytics', () => {
  it('never runs on Persona, staff, admin or other signed-in pages', () => {
    for (const p of ['/persona', '/persona/start', '/persona/space/abc', '/persona/explore', '/staff/persona', '/admin', '/admin/cases/1', '/portal', '/practitioner']) {
      expect(isAnalyticsExcluded(p), p).toBe(true);
    }
    for (const p of ['/', '/book', '/support', '/resources/sleep', '/personal-growth']) {
      expect(isAnalyticsExcluded(p), p).toBe(false);
    }
  });

  describe('in the browser', () => {
    beforeEach(() => window.history.replaceState(null, '', '/persona/start'));

    it('does not load on a private page, loads once on a public one, and switches off again', () => {
      startAnalytics();
      expect(scripts()).toBe(0);
      expect(flags[FLAG]).toBe(true);

      window.history.pushState(null, '', '/book');
      expect(scripts()).toBe(1);
      expect(flags[FLAG]).toBe(false);

      window.history.pushState(null, '', '/admin/cases/123');
      expect(flags[FLAG]).toBe(true);

      window.history.pushState(null, '', '/support');
      expect(flags[FLAG]).toBe(false);
      expect(scripts()).toBe(1);
    });
  });
});
