/**
 * Mock the logger module to prevent actual logging during tests
 * and to allow us to verify if and how logger functions were called
 */
jest.mock('../../../modules/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => {
  throw new Error(`process.exit called with code: ${code}`);
});

describe('Environment module', () => {
  /**
   * Set up mocks before each test
   */
  beforeEach(() => {
    // Reset modules to ensure clean imports for each test
    jest.resetModules();
  });

  /**
   * Clean up after each test to prevent test contamination
   */
  afterEach(() => {
    // Restore original process.env
    process.env = {};
  });

  /**
   * Test case: Verify environment validation succeeds with all required fields
   */
  it('should validate and return environment variables when all required fields are present', async () => {
    // Setup test environment with required variables
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';

    // Clear NODE_ENV to test the default behavior
    // Note: Jest sets NODE_ENV=test automatically, so we need to explicitly
    // delete it to verify our default value logic
    delete process.env.NODE_ENV;

    // Import the module after setting up the environment
    const { env } = await import('../../../modules/environment/index');

    // Verify the environment object contains expected values
    expect(env).toEqual({
      NODE_ENV: 'development', // default value should be applied since we deleted NODE_ENV
      LOG_LEVEL: 'info', // default value
      DISCORD_TOKEN: 'test-token',
      DISCORD_CLIENT_ID: 'test-client-id',
      DISCORD_GUILD_ID: 'test-guild-id',
    });
  });

  /**
   * Test case: Verify Jest's automatic NODE_ENV setting
   */
  it('should use NODE_ENV=test when Jest sets it automatically', async () => {
    // Setup test environment with required variables
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';

    // Explicitly set NODE_ENV=test to simulate Jest's behavior
    process.env.NODE_ENV = 'test';

    // Import the module after setting up the environment
    const { env } = await import('../../../modules/environment/index');

    // Verify that NODE_ENV=test is used (which is what Jest sets automatically)
    expect(env.NODE_ENV).toBe('test');

    // Verify other environment values
    expect(env).toEqual({
      NODE_ENV: 'test', // Jest sets this automatically
      LOG_LEVEL: 'info', // default value
      DISCORD_TOKEN: 'test-token',
      DISCORD_CLIENT_ID: 'test-client-id',
      DISCORD_GUILD_ID: 'test-guild-id',
    });
  });

  /**
   * Test case: Verify default values are used when optional variables are not provided
   */
  it('should use default values when optional environment variables are not provided', async () => {
    // Setup test environment with only required variables
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';

    // Clear NODE_ENV to test the default behavior
    // Note: Jest sets NODE_ENV=test automatically, so we need to explicitly
    // delete it to verify our default value logic
    delete process.env.NODE_ENV;

    // Import the module after setting up the environment
    const { env } = await import('../../../modules/environment/index');

    // Verify default values are applied
    expect(env.NODE_ENV).toBe('development');
    expect(env.LOG_LEVEL).toBe('info');
  });

  /**
   * Test case: Verify enum validation accepts valid values
   */
  it('should validate enum values correctly', async () => {
    // Setup test environment with valid enum values
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'debug';

    // Import the module after setting up the environment
    const { env } = await import('../../../modules/environment/index');

    // Verify enum values were correctly parsed
    expect(env.NODE_ENV).toBe('production');
    expect(env.LOG_LEVEL).toBe('debug');
  });
  it('should throw an error if enum values are invalid', async () => {
    // Setup test environment with invalid enum values
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';
    process.env.NODE_ENV = 'invalid-env';

    try {
      // Attempt to import the module, which should trigger validation and throw an error
      await import('../../../modules/environment/index');
    } catch (error: unknown) {
      // Verify that the error is an instance of Error and contains the expected message
      if (error instanceof Error) {
        expect(error.message).toContain('process.exit called with code: 1');
      } else {
        throw new Error('Unexpected error type');
      }
    }
    // Verify that logger.error was called with the expected message
    const { logger } = await import('../../../modules/logger');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid environment variables:')
    );
    // Verify that process.exit was called with the expected code
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  /**
   * Test case: Verify unknown error handling during environment validation
   */
  it('should handle unknown errors during environment validation', async () => {
    // Mock Zod module only for this test
    jest.doMock('zod', () => {
      const originalModule = jest.requireActual('zod');
      return {
        ...originalModule,
        z: {
          ...originalModule.z,
          object: () => {
            const obj = originalModule.z.object({});
            // Override the parse method to throw a generic error
            obj.parse = jest.fn().mockImplementation(() => {
              throw new Error('Some unexpected error');
            });
            return obj;
          },
        },
      };
    });

    // Setup test environment with required variables
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_GUILD_ID = 'test-guild-id';

    try {
      // Attempt to import the module, which should trigger validation and throw an error
      await import('../../../modules/environment/index');
      fail('Should have thrown an error');
    } catch (error: unknown) {
      // Verify that the error is an instance of Error and contains the expected message
      if (error instanceof Error) {
        expect(error.message).toContain('process.exit called with code: 1');
      } else {
        throw new Error('Unexpected error type');
      }
    }

    // Verify that logger.error was called with the expected message
    const { logger } = await import('../../../modules/logger');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Unknown error during environment validation:')
    );

    // Verify that process.exit was called with the expected code
    expect(mockExit).toHaveBeenCalledWith(1);

    // Clear the mock to avoid affecting other tests
    jest.dontMock('zod');
  });
});
