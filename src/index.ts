/**
 * The Library — Main Entry Point
 * Knowledge management and documentation for the Trancendos mesh.
 * Architecture: Trancendos Industry 6.0 / 2060 Standard
 */
import { logger } from './utils/logger';
import { createServer } from './api/server';
import { knowledgeBase } from './knowledge/knowledge-base';

const PORT = parseInt(process.env.PORT || '3013', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap(): Promise<void> {
  logger.info({ service: 'the-library', port: PORT }, 'The Library bootstrapping...');
  const stats = knowledgeBase.getStats();
  logger.info({ docs: stats.totalDocs }, 'Knowledge base verified');
  const app = createServer();
  const server = app.listen(PORT, HOST, () => logger.info({ host: HOST, port: PORT }, 'The Library listening — knowledge is power'));
  const shutdown = (signal: string) => { logger.info({ signal }, 'Shutdown'); server.close(() => { logger.info('The Library shutdown complete'); process.exit(0); }); setTimeout(() => process.exit(1), 10_000); };
  process.on('SIGTERM', () => shutdown('SIGTERM')); process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => { logger.error({ err }, 'Uncaught exception'); shutdown('uncaughtException'); });
  process.on('unhandledRejection', (reason) => { logger.error({ reason }, 'Unhandled rejection'); });
}
bootstrap().catch((err) => { logger.error({ err }, 'Bootstrap failed'); process.exit(1); });