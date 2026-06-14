import dns from 'dns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../../modules/logger';
import { checkInternetConnection, waitForInternetConnection } from '../../../modules/utils/network';

vi.mock('../../../modules/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('dns');

const mockLookup = dns.lookup as unknown as ReturnType<typeof vi.fn>;

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address?: string,
  family?: number
) => void;

describe('checkInternetConnection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve to true if dns.lookup succeeds', async () => {
    mockLookup.mockImplementation((_domain: string, callback: LookupCallback) => {
      callback(null, '127.0.0.1');
    });

    const result = await checkInternetConnection('example.com');
    expect(result).toBe(true);
  });

  it('should resolve to false if dns.lookup fails', async () => {
    mockLookup.mockImplementation((_domain: string, callback: LookupCallback) => {
      callback(new Error('DNS lookup failed'));
    });

    const result = await checkInternetConnection('example.com');
    expect(result).toBe(false);
  });

  it('should use default domain (discord.com) when no domain is specified', async () => {
    mockLookup.mockImplementation((domain: string, callback: LookupCallback) => {
      expect(domain).toBe('discord.com');
      callback(null, '127.0.0.1');
    });

    const result = await checkInternetConnection();
    expect(result).toBe(true);
  });
});

describe('waitForInternetConnection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should wait until connection is available and log appropriately', async () => {
    mockLookup
      .mockImplementationOnce((_domain: string, callback: LookupCallback) =>
        callback(new Error('Fail'))
      )
      .mockImplementationOnce((_domain: string, callback: LookupCallback) =>
        callback(null, '127.0.0.1')
      );

    const promise = waitForInternetConnection(1000, 'example.com');

    await Promise.resolve();

    expect(logger.debug).toHaveBeenCalledWith('Checking internet connection...');
    expect(logger.warn).toHaveBeenCalledWith(
      'No internet connection available, retrying in 1 seconds...'
    );

    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    expect(logger.debug).toHaveBeenCalledWith(
      'Internet connection available, proceeding with initialization'
    );
  });

  it('should use default parameters when not specified', async () => {
    mockLookup.mockImplementation((domain: string, callback: LookupCallback) => {
      expect(domain).toBe('discord.com');
      callback(null, '127.0.0.1');
    });

    const promise = waitForInternetConnection();

    await Promise.resolve();
    await promise;

    expect(mockLookup).toHaveBeenCalledWith('discord.com', expect.any(Function));
    expect(logger.debug).toHaveBeenCalledWith(
      'Internet connection available, proceeding with initialization'
    );
  });

  it('should proceed immediately when connection is available on first attempt', async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    mockLookup.mockImplementation((_domain: string, callback: LookupCallback) => {
      callback(null, '127.0.0.1');
    });

    await waitForInternetConnection(30000, 'example.com');

    expect(logger.debug).toHaveBeenCalledWith('Checking internet connection...');
    expect(logger.debug).toHaveBeenCalledWith(
      'Internet connection available, proceeding with initialization'
    );
    expect(logger.warn).not.toHaveBeenCalled();
    expect(mockLookup).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
