import app from './app';
import { logger } from '../DST_API_DOCS.Infrastructure/logging/Logger';
import { closeDatabaseContext } from '../DST_API_DOCS.Persistence/context/DatabaseContext';

const rawPort = process.env['PORT'];
if (!rawPort) throw new Error('PORT environment variable is required');

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

const server = app.listen(port, () => {
  logger.info({ port }, 'DST_API_DOCS server listening');
});

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(async () => {
    await closeDatabaseContext();
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
