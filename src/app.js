import Bridge from './bridge';
import { logger } from './lib';

const appLogger = logger.getLogger('Bridge');

const bridge = new Bridge();

bridge.connect();

process.on('uncaughtException', (err) => {
  appLogger.error('Unhandled exception', err);
});
process.on('unhandledRejection', (err) => {
  appLogger.error('Unhandled rejection', err);
});
process.on('SIGTERM', async () => {
  appLogger.info('Received SIGTERM, going to shutdown server.');
  await bridge.disconnect();
  appLogger.info('Exited... Buy :)');
});
