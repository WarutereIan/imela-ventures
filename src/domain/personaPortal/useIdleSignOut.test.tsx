import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdleSignOut } from './useIdleSignOut';

describe('useIdleSignOut', () => {
  it('signs out after inactivity and resets on interaction', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();
    renderHook(() => useIdleSignOut(true, onIdle, 15));
    act(() => void vi.advanceTimersByTime(14 * 60_000));
    window.dispatchEvent(new Event('keydown'));
    act(() => void vi.advanceTimersByTime(14 * 60_000));
    expect(onIdle).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(60_001));
    expect(onIdle).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('does nothing while inactive', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();
    renderHook(() => useIdleSignOut(false, onIdle, 1));
    act(() => void vi.advanceTimersByTime(10 * 60_000));
    expect(onIdle).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
