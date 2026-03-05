/**
 * The Library — REST API Server
 * Knowledge management, full-text search, versioning
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors'; import helmet from 'helmet'; import morgan from 'morgan';
import { logger } from '../utils/logger';
import { knowledgeBase } from '../knowledge/knowledge-base';
import type { DocType, DocStatus } from '../knowledge/knowledge-base';

export function createServer(): express.Application {
  const app = express();
  app.use(helmet()); app.use(cors()); app.use(express.json({ limit: '2mb' }));
  app.use(morgan('combined', { stream: { write: (m: string) => logger.info({ http: m.trim() }, 'HTTP') } }));

  app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'the-library', uptime: process.uptime(), timestamp: new Date().toISOString(), ...knowledgeBase.getStats() }));
  app.get('/metrics', (_req, res) => { const mem = process.memoryUsage(); res.json({ service: 'the-library', uptime: process.uptime(), memory: { heapUsedMb: Math.round(mem.heapUsed/1024/1024) }, stats: knowledgeBase.getStats() }); });

  // Docs CRUD
  app.get('/api/v1/docs', (req, res) => {
    const docs = knowledgeBase.getDocs({ type: req.query.type as DocType, status: req.query.status as DocStatus, author: req.query.author as string, tags: req.query.tags ? (req.query.tags as string).split(',') : undefined });
    res.json({ count: docs.length, docs });
  });
  app.post('/api/v1/docs', (req, res) => {
    try { const doc = knowledgeBase.createDoc(req.body); res.status(201).json(doc); }
    catch (err) { res.status(500).json({ error: String(err) }); }
  });
  app.get('/api/v1/docs/:id', (req, res) => {
    const doc = knowledgeBase.getDoc(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    return res.json(doc);
  });
  app.put('/api/v1/docs/:id', (req, res) => {
    const doc = knowledgeBase.updateDoc(req.params.id, req.body);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    return res.json(doc);
  });
  app.delete('/api/v1/docs/:id', (req, res) => res.json({ deleted: knowledgeBase.deleteDoc(req.params.id) }));

  // Versions
  app.get('/api/v1/docs/:id/versions', (req, res) => res.json({ versions: knowledgeBase.getVersions(req.params.id) }));
  app.post('/api/v1/docs/:id/restore/:version', (req, res) => {
    const doc = knowledgeBase.restoreVersion(req.params.id, parseInt(req.params.version));
    if (!doc) return res.status(404).json({ error: 'Document or version not found' });
    return res.json(doc);
  });

  // Search
  app.get('/api/v1/search', (req, res) => {
    const { q, limit } = req.query;
    if (!q) return res.status(400).json({ error: 'q query parameter required' });
    const results = knowledgeBase.search(q as string, limit ? parseInt(limit as string) : 20);
    return res.json({ count: results.length, results });
  });

  app.get('/api/v1/stats', (_req, res) => res.json(knowledgeBase.getStats()));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => { logger.error({ err }, 'Unhandled error'); res.status(500).json({ error: err.message }); });
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  return app;
}