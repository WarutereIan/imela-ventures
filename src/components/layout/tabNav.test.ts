import { describe, expect, it } from 'vitest';
import { activeTab } from './tabNav';

describe('mobile tab bar routing', () => {
  it('highlights the right tab', () => {
    expect(activeTab('/')).toBe('home');
    expect(activeTab('/support/bereavement')).toBe('support');
    expect(activeTab('/find-support')).toBe('support');
    expect(activeTab('/persona')).toBe('persona');
    expect(activeTab('/persona/space/abc')).toBe('persona');
    expect(activeTab('/book')).toBe('book');
    expect(activeTab('/who-we-are')).toBe('more');
    expect(activeTab('/resources/grief-has-no-timetable')).toBe('more');
    expect(activeTab('/admin')).toBeNull();
  });
});
