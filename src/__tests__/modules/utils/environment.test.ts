import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../modules/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

const mockExit = vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => {
  throw new Error(`process.exit called with code: ${code}`);
});

describe('Environment module', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.DISCORD_TOKEN;
    delete process.env.DISCORD_CLIENT_ID;
    delete process.env.DISCORD_GUILD_ID;
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
  });

  it('should validate and return environment variables when all required fields are present', async () => {
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';
    delete process.env.NODE_ENV;

    const { env } = await import('../../../modules/environment/index');

    expect(env).toEqual({
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      DISCORD_TOKEN: 'test-token',
      DISCORD_CLIENT_ID: 'test-client-id',
      DISCORD_GUILD_ID: 'test-guild-id',
    });
  });

  it('should use NODE_ENV=test when the test runner sets it', async () => {
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';
    process.env.NODE_ENV = 'test';

    const { env } = await import('../../../modules/environment/index');

    expect(env.NODE_ENV).toBe('test');
    expect(env).toEqual({
      NODE_ENV: 'test',
      LOG_LEVEL: 'info',
      DISCORD_TOKEN: 'test-token',
      DISCORD_CLIENT_ID: 'test-client-id',
      DISCORD_GUILD_ID: 'test-guild-id',
    });
  });

  it('should use default values when optional environment variables are not provided', async () => {
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';
    delete process.env.NODE_ENV;

    const { env } = await import('../../../modules/environment/index');

    expect(env.NODE_ENV).toBe('development');
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('should validate enum values correctly', async () => {
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'debug';

    const { env } = await import('../../../modules/environment/index');

    expect(env.NODE_ENV).toBe('production');
    expect(env.LOG_LEVEL).toBe('debug');
  });

  it('should throw an error if enum values are invalid', async () => {
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';
    process.env.NODE_ENV = 'invalid-env';

    try {
      await import('../../../modules/environment/index');
      expect.fail('Should have thrown an error');
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toContain('process.exit called with code: 1');
      } else {
        throw new Error('Unexpected error type', { cause: error });
      }
    }

    const { logger } = await import('../../../modules/logger');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid environment variables:')
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle unknown errors during environment validation', async () => {
    vi.doMock('zod', async (importOriginal) => {
      const originalModule = await importOriginal<typeof import('zod')>();
      return {
        ...originalModule,
        z: {
          ...originalModule.z,
          object: () => {
            const obj = originalModule.z.object({});
            obj.parse = vi.fn().mockImplementation(() => {
              throw new Error('Some unexpected error');
            });
            return obj;
          },
        },
      };
    });

    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';

    try {
      try {
        await import('../../../modules/environment/index');
        expect.fail('Should have thrown an error');
      } catch (error: unknown) {
        if (error instanceof Error) {
          expect(error.message).toContain('process.exit called with code: 1');
        } else {
          throw new Error('Unexpected error type', { cause: error });
        }
      }

      const { logger } = await import('../../../modules/logger');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error during environment validation:')
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    } finally {
      vi.doUnmock('zod');
      vi.resetModules();
    }
  });
});
