import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('cooldowns', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when not on cooldown', async () => {
    const { getCooldownRemaining } = await import('../../../modules/commands/cooldowns');
    expect(getCooldownRemaining('user:ping')).toBeNull();
  });

  it('returns remaining seconds after setCooldown', async () => {
    const { getCooldownRemaining, setCooldown } = await import(
      '../../../modules/commands/cooldowns'
    );

    setCooldown('user:ping', 5);
    expect(getCooldownRemaining('user:ping')).toBe(5);

    vi.advanceTimersByTime(2000);
    expect(getCooldownRemaining('user:ping')).toBe(3);
  });

  it('returns null after cooldown expires', async () => {
    const { getCooldownRemaining, setCooldown } = await import(
      '../../../modules/commands/cooldowns'
    );

    setCooldown('user:ping', 2);
    vi.advanceTimersByTime(2000);
    expect(getCooldownRemaining('user:ping')).toBeNull();
  });
});
