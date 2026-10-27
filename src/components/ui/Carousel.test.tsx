import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Carousel } from './Carousel';

describe('Carousel', () => {
  it('exposes an accessible carousel with labelled slides', () => {
    render(
      <Carousel label="Areas we help with">
        <p>One</p>
        <p>Two</p>
        <p>Three</p>
      </Carousel>
    );
    const region = screen.getByRole('region', { name: 'Areas we help with' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getAllByRole('group').map((g) => g.getAttribute('aria-label'))).toEqual(['1 of 3', '2 of 3', '3 of 3']);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('renders every slide so content stays in the DOM (no hidden or lazy slides)', () => {
    render(
      <Carousel label="Steps">
        <p>Alpha</p>
        <p>Beta</p>
      </Carousel>
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('hides controls for a single slide', () => {
    render(
      <Carousel label="Single">
        <p>Only</p>
      </Carousel>
    );
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('applies per-slide classes for grid spans', () => {
    render(
      <Carousel label="Bento" slideClassNames={['lg:col-span-2', undefined]}>
        <p>Big</p>
        <p>Small</p>
      </Carousel>
    );
    const [first, second] = screen.getAllByRole('group');
    expect(first.className).toContain('lg:col-span-2');
    expect(second.className).not.toContain('lg:col-span-2');
  });
});
