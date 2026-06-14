const cooldowns = new Map<string, number>();

/**
 * Returns remaining cooldown seconds if the key is still on cooldown.
 */
export const getCooldownRemaining = (key: string): number | null => {
  const expiresAt = cooldowns.get(key);
  if (!expiresAt) {
    return null;
  }

  const remainingMs = expiresAt - Date.now();
  if (remainingMs <= 0) {
    cooldowns.delete(key);
    return null;
  }

  return Math.ceil(remainingMs / 1000);
};

/**
 * Start a cooldown for the given key.
 */
export const setCooldown = (key: string, cooldownSeconds: number): void => {
  cooldowns.set(key, Date.now() + cooldownSeconds * 1000);
};
