import dns from 'dns';
import { logger } from '../../../modules/logger';
import { checkInternetConnection, waitForInternetConnection } from '../../../modules/utils/network';

/**
 * Mock the logger module to prevent actual logging during tests
 * and to allow us to verify if and how logger functions were called
 */
jest.mock('../../../modules/logger', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

/**
 * Mock the dns module to control its behavior in tests
 * This allows us to simulate both successful and failed DNS lookups
 */
jest.mock('dns');

// Create a typed mock for the dns.lookup function
const mockLookup = dns.lookup as unknown as jest.Mock;

describe('checkInternetConnection', () => {
  /**
   * Reset all mocks between tests to prevent test contamination
   * This ensures one test's mock behavior doesn't affect another test
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test case: Verify the function returns true when DNS lookup succeeds
   * This simulates having an internet connection available
   */
  it('should resolve to true if dns.lookup succeeds', async () => {
    // Mock successful DNS lookup by providing null as the error parameter
    mockLookup.mockImplementation((_domain, callback) => {
      callback(null, '127.0.0.1');
    });

    const result = await checkInternetConnection('example.com');
    expect(result).toBe(true);
  });

  /**
   * Test case: Verify the function returns false when DNS lookup fails
   * This simulates not having an internet connection
   */
  it('should resolve to false if dns.lookup fails', async () => {
    // Mock failed DNS lookup by providing an Error object
    mockLookup.mockImplementation((_domain, callback) => {
      callback(new Error('DNS lookup failed'));
    });

    const result = await checkInternetConnection('example.com');
    expect(result).toBe(false);
  });

  /**
   * Test case: Verify default parameter handling
   * This tests the default value of the domain parameter (discord.com)
   */
  it('should use default domain (discord.com) when no domain is specified', async () => {
    // Mock implementation that checks the domain parameter value
    mockLookup.mockImplementation((domain, callback) => {
      // Assert that the domain is the default value
      expect(domain).toBe('discord.com');
      callback(null, '127.0.0.1');
    });

    const result = await checkInternetConnection();
    expect(result).toBe(true);
  });
});

describe('waitForInternetConnection', () => {
  /**
   * Set up fake timers before each test
   * Fake timers allow us to "fast forward" time in tests rather than waiting
   * for real timeouts to complete
   */
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  /**
   * Clean up after each test by restoring real timers and clearing mocks
   */
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  /**
   * Test case: Verify retry behavior when connection is initially unavailable
   * This tests the retry logic and logging when internet is not available at first
   */
  it('should wait until connection is available and log appropriately', async () => {
    // Mock DNS lookup to fail on first call and succeed on second call
    // This simulates internet connection becoming available after initial failure
    mockLookup
      .mockImplementationOnce((_domain, callback) => callback(new Error('Fail')))
      .mockImplementationOnce((_domain, callback) => callback(null, '127.0.0.1'));

    // Start the wait function with a short retry interval (1 second)
    const promise = waitForInternetConnection(1000, 'example.com');

    // First check - we need to allow the initial promise to resolve
    await Promise.resolve();

    // Verify initial logs were called as expected
    expect(logger.debug).toHaveBeenCalledWith('Checking internet connection...');
    expect(logger.warn).toHaveBeenCalledWith(
      'No internet connection available, retrying in 1 seconds...'
    );

    // Fast forward time to simulate waiting for the retry interval
    // This triggers the setTimeout callback without waiting real time
    jest.advanceTimersByTime(1000);

    // Wait for the full function to complete
    await promise;

    // Verify final success log was called
    expect(logger.debug).toHaveBeenCalledWith(
      'Internet connection available, proceeding with initialization'
    );
  });

  /**
   * Test case: Verify default parameter handling
   * This tests that the function works correctly with default parameters
   */
  it('should use default parameters when not specified', async () => {
    // Mock successful DNS lookup
    mockLookup.mockImplementation((domain, callback) => {
      // Verify the domain being passed is the default one
      expect(domain).toBe('discord.com');
      callback(null, '127.0.0.1');
    });

    // Call the function with default parameters
    const promise = waitForInternetConnection();

    // Allow any microtasks (promises) to resolve
    await Promise.resolve();

    // Wait for the function to complete
    await promise;

    // Verify that the DNS lookup was called with the default domain
    expect(mockLookup).toHaveBeenCalledWith('discord.com', expect.any(Function));

    // Verify appropriate logs were made
    expect(logger.debug).toHaveBeenCalledWith(
      'Internet connection available, proceeding with initialization'
    );
  });

  /**
   * Test case: Verify immediate completion when connection is available
   * This tests that the function doesn't wait or retry when connection is available immediately
   */
  it('should proceed immediately when connection is available on first attempt', async () => {
    // Ensure fake timers are active for this test
    jest.useFakeTimers();

    // Reset all mocks to ensure clean state
    jest.clearAllMocks();

    // Mock successful DNS lookup on first attempt
    mockLookup.mockImplementation((_domain, callback) => {
      callback(null, '127.0.0.1');
    });

    // Call the function with explicit parameters
    await waitForInternetConnection(30000, 'example.com');

    // Verify that the correct debug logs were called
    expect(logger.debug).toHaveBeenCalledWith('Checking internet connection...');
    expect(logger.debug).toHaveBeenCalledWith(
      'Internet connection available, proceeding with initialization'
    );

    // Verify that the warning log was NOT called since connection was successful
    expect(logger.warn).not.toHaveBeenCalled();

    // Verify that the DNS lookup was called exactly once
    // This confirms no retry attempts were made
    expect(mockLookup).toHaveBeenCalledTimes(1);

    // Restore real timers to avoid affecting other tests
    jest.useRealTimers();
  });
});
