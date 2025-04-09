import dns from 'dns';
import { logger } from '../logger';

/**
 * Check if internet connection is available by attempting to resolve a DNS
 * @param domain The domain to resolve, defaults to discord.com
 * @returns Promise that resolves to true if connection is available, false otherwise
 */
export const checkInternetConnection = (domain = 'discord.com'): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    dns.lookup(domain, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Wait for internet connection with retries at specified interval
 * @param retryIntervalMs Time in milliseconds between retry attempts, defaults to 30000 (30 seconds)
 * @param domain The domain to check against, defaults to discord.com
 */
export const waitForInternetConnection = async (
  retryIntervalMs = 30000,
  domain = 'discord.com'
): Promise<void> => {
  let connected = false;

  while (!connected) {
    logger.debug('Checking internet connection...');
    connected = await checkInternetConnection(domain);

    if (connected) {
      logger.debug('Internet connection available, proceeding with initialization');
      break;
    }

    logger.warn(
      `No internet connection available, retrying in ${retryIntervalMs / 1000} seconds...`
    );
    await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
  }
};
