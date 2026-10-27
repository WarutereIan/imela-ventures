import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NeedFinder } from './NeedFinder';

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <NeedFinder />
    </MemoryRouter>
  );
  return { user, input: screen.getByLabelText(/Describe what you need/) };
}

describe('NeedFinder', () => {
  it('asks for input instead of searching on empty submit', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Find Support/ }));
    expect(screen.getByText(/Write a few words/)).toBeInTheDocument();
    expect(screen.queryByText('Options that may fit')).not.toBeInTheDocument();
  });

  it('shows grounded options with reasons for an ordinary need', async () => {
    const { user, input } = setup();
    await user.type(input, 'I lost my job and I feel overwhelmed by everything');
    await user.click(screen.getByRole('button', { name: /Find Support/ }));
    expect(await screen.findByText('Options that may fit')).toBeInTheDocument();
    expect(screen.getAllByText(/Why this may help/).length).toBeGreaterThan(0);
  });

  it('prioritises urgent human support over recommendations when risk is expressed', async () => {
    const { user, input } = setup();
    await user.type(input, 'I want to end my life');
    await user.click(screen.getByRole('button', { name: /Find Support/ }));
    expect(await screen.findByText('Your safety comes first.')).toBeInTheDocument();
    expect(screen.getByText('999 or 112')).toBeInTheDocument();
    expect(screen.queryByText('Options that may fit')).not.toBeInTheDocument();
  });
});
