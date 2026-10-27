import { describe, expect, it } from 'vitest';
import { activeTab, isTabBarHidden } from './tabNav';

describe('mobile tab bar routing', () => {
  it('highlights the right tab', () => {
    expect(activeTab('/')).toBe('home');
    expect(activeTab('/support/bereavement')).toBe('support');
    expect(activeTab('/find-support')).toBe('support');
    expect(activeTab('/persona')).toBe('persona');
    expect(activeTab('/book')).toBe('book');
    expect(activeTab('/who-we-are')).toBe('more');
    expect(activeTab('/resources/grief-has-no-timetable')).toBe('more');
    expect(activeTab('/somewhere-else')).toBeNull();
  });

  it('steps aside on screens with their own bottom controls', () => {
    for (const p of ['/book', '/persona/explore', '/persona/start', '/persona/access', '/persona/space', '/persona/space/abc', '/staff/persona', '/practitioner', '/portal']) {
      expect(isTabBarHidden(p)).toBe(true);
    }
    for (const p of ['/', '/persona', '/support', '/resources', '/organisations']) {
      expect(isTabBarHidden(p)).toBe(false);
    }
  });
});
