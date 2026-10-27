import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ConcernPage from '../../pages/support/ConcernPage';
import SupportDirectoryPage from '../../pages/support/SupportDirectoryPage';
import { searchConcerns } from './search';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/support" element={<SupportDirectoryPage />} />
        <Route path="/support/:slug" element={<ConcernPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ConcernPage', () => {
  it('renders bereavement with its own heading and a safety callout', () => {
    renderAt('/support/bereavement');
    expect(screen.getByRole('heading', { level: 1, name: /Bereavement$/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /If you're not safe right now/i })).toBeInTheDocument();
    expect(screen.getAllByText('999 or 112').length).toBeGreaterThan(0);
  });

  it('never offers booking for a referral-only service', () => {
    renderAt('/support/neurodiversity');
    expect(screen.getByRole('heading', { level: 1, name: /Neurodiversity/ })).toBeInTheDocument();
    const referralCard = screen.getByRole('heading', { name: /Neurodiversity Assessment/ }).closest('article')!;
    expect(within(referralCard).queryByRole('link', { name: /Book session/i })).toBeNull();
    expect(within(referralCard).getByRole('link', { name: /referral/i })).toBeInTheDocument();
  });

  it('shows a not-found page for an unknown slug', () => {
    renderAt('/support/not-a-real-topic');
    expect(screen.getByRole('heading', { level: 1, name: /couldn't find that page/i })).toBeInTheDocument();
  });
});

describe('Support directory', () => {
  it('prefills search from ?q= and lists matching topics', () => {
    renderAt('/support?q=exams');
    expect(screen.getByRole('searchbox')).toHaveValue('exams');
    expect(screen.getByRole('heading', { name: /that may fit/i })).toBeInTheDocument();
  });

  it('search matches everyday words', () => {
    expect(searchConcerns('betting').map((c) => c.slug)).toContain('gambling');
    expect(searchConcerns('')).toEqual([]);
  });
});
