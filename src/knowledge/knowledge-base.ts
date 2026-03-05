/**
 * The Library — Knowledge Base
 *
 * Centralised knowledge management, documentation storage, full-text search,
 * and AI-assisted content suggestions for the Trancendos mesh.
 *
 * Migrated from: norman-ai's LivingDocsEngine + shared/templateLibrary.ts
 * Zero-cost: All operations are in-memory, rule-based.
 *
 * Architecture: Trancendos Industry 6.0 / 2060 Standard
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export type DocType = 'guide' | 'reference' | 'tutorial' | 'architecture' | 'runbook' | 'adr' | 'changelog' | 'glossary';
export type DocStatus = 'draft' | 'review' | 'published' | 'archived' | 'deprecated';

export interface KnowledgeDoc {
  id: string;
  title: string;
  type: DocType;
  status: DocStatus;
  content: string;
  summary: string;
  tags: string[];
  author: string;
  version: number;
  versions: DocVersion[];
  relatedDocs: string[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface DocVersion {
  version: number;
  content: string;
  summary: string;
  changedBy: string;
  changedAt: Date;
  changeNote: string;
}

export interface SearchResult {
  doc: KnowledgeDoc;
  score: number;
  matchedFields: string[];
  snippet: string;
}

export interface LibraryStats {
  totalDocs: number;
  publishedDocs: number;
  draftDocs: number;
  archivedDocs: number;
  totalViews: number;
  docsByType: Record<DocType, number>;
  recentlyUpdated: number;
}

export class KnowledgeBase {
  private docs: Map<string, KnowledgeDoc> = new Map();

  constructor() {
    this.seedDefaultDocs();
    logger.info({ docCount: this.docs.size }, 'KnowledgeBase initialised');
  }

  createDoc(params: { title: string; type: DocType; content: string; summary?: string; tags?: string[]; author?: string }): KnowledgeDoc {
    const doc: KnowledgeDoc = {
      id: uuidv4(), title: params.title, type: params.type, status: 'draft',
      content: params.content, summary: params.summary || this.generateSummary(params.content),
      tags: params.tags || [], author: params.author || 'system', version: 1,
      versions: [{ version: 1, content: params.content, summary: params.summary || '', changedBy: params.author || 'system', changedAt: new Date(), changeNote: 'Initial version' }],
      relatedDocs: [], viewCount: 0, createdAt: new Date(), updatedAt: new Date(),
    };
    this.docs.set(doc.id, doc);
    logger.info({ docId: doc.id, title: doc.title, type: doc.type }, 'Document created');
    return doc;
  }

  updateDoc(id: string, updates: { title?: string; content?: string; summary?: string; tags?: string[]; status?: DocStatus; changeNote?: string; changedBy?: string }): KnowledgeDoc | null {
    const doc = this.docs.get(id);
    if (!doc) return null;
    if (updates.content && updates.content !== doc.content) {
      doc.version++;
      doc.versions.push({ version: doc.version, content: updates.content, summary: updates.summary || doc.summary, changedBy: updates.changedBy || 'system', changedAt: new Date(), changeNote: updates.changeNote || 'Updated' });
    }
    if (updates.title) doc.title = updates.title;
    if (updates.content) doc.content = updates.content;
    if (updates.summary) doc.summary = updates.summary;
    if (updates.tags) doc.tags = updates.tags;
    if (updates.status) { doc.status = updates.status; if (updates.status === 'published') doc.publishedAt = new Date(); }
    doc.updatedAt = new Date();
    return doc;
  }

  getDoc(id: string): KnowledgeDoc | undefined {
    const doc = this.docs.get(id);
    if (doc) doc.viewCount++;
    return doc;
  }

  getDocs(filters?: { type?: DocType; status?: DocStatus; tags?: string[]; author?: string }): KnowledgeDoc[] {
    let docs = Array.from(this.docs.values());
    if (filters?.type) docs = docs.filter(d => d.type === filters.type);
    if (filters?.status) docs = docs.filter(d => d.status === filters.status);
    if (filters?.author) docs = docs.filter(d => d.author === filters.author);
    if (filters?.tags?.length) docs = docs.filter(d => filters.tags!.some(t => d.tags.includes(t)));
    return docs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  deleteDoc(id: string): boolean { return this.docs.delete(id); }

  search(query: string, limit = 20): SearchResult[] {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results: SearchResult[] = [];

    for (const doc of this.docs.values()) {
      if (doc.status === 'archived') continue;
      let score = 0;
      const matchedFields: string[] = [];

      for (const term of terms) {
        if (doc.title.toLowerCase().includes(term)) { score += 10; if (!matchedFields.includes('title')) matchedFields.push('title'); }
        if (doc.summary.toLowerCase().includes(term)) { score += 5; if (!matchedFields.includes('summary')) matchedFields.push('summary'); }
        if (doc.content.toLowerCase().includes(term)) { score += 2; if (!matchedFields.includes('content')) matchedFields.push('content'); }
        if (doc.tags.some(t => t.toLowerCase().includes(term))) { score += 8; if (!matchedFields.includes('tags')) matchedFields.push('tags'); }
      }

      if (score > 0) {
        const idx = doc.content.toLowerCase().indexOf(terms[0]);
        const snippet = idx >= 0 ? doc.content.slice(Math.max(0, idx - 50), idx + 150) : doc.summary;
        results.push({ doc, score, matchedFields, snippet: snippet.trim() });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  getVersions(id: string): DocVersion[] {
    return this.docs.get(id)?.versions || [];
  }

  restoreVersion(id: string, version: number): KnowledgeDoc | null {
    const doc = this.docs.get(id);
    if (!doc) return null;
    const v = doc.versions.find(v => v.version === version);
    if (!v) return null;
    return this.updateDoc(id, { content: v.content, summary: v.summary, changeNote: `Restored to version ${version}` });
  }

  getStats(): LibraryStats {
    const docs = Array.from(this.docs.values());
    const types: DocType[] = ['guide', 'reference', 'tutorial', 'architecture', 'runbook', 'adr', 'changelog', 'glossary'];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return {
      totalDocs: docs.length,
      publishedDocs: docs.filter(d => d.status === 'published').length,
      draftDocs: docs.filter(d => d.status === 'draft').length,
      archivedDocs: docs.filter(d => d.status === 'archived').length,
      totalViews: docs.reduce((s, d) => s + d.viewCount, 0),
      docsByType: Object.fromEntries(types.map(t => [t, docs.filter(d => d.type === t).length])) as Record<DocType, number>,
      recentlyUpdated: docs.filter(d => d.updatedAt >= weekAgo).length,
    };
  }

  private generateSummary(content: string): string {
    const firstPara = content.split('\n\n')[0] || content;
    return firstPara.slice(0, 200).trim() + (firstPara.length > 200 ? '...' : '');
  }

  private seedDefaultDocs(): void {
    this.createDoc({ title: 'Trancendos Architecture Overview', type: 'architecture', content: 'The Trancendos Industry 6.0 architecture consists of a 24-agent mesh with 7 core agents, 5 process agents, and 12 specialized agents. All services operate under the zero-cost mandate.', tags: ['architecture', 'overview', 'agents'], author: 'system' });
    this.createDoc({ title: 'Zero-Cost Mandate', type: 'guide', content: 'All Trancendos services must operate at $0 cost using open-source, self-hosted, and free-tier services only. Dorris AI enforces this mandate across all departments.', tags: ['finance', 'mandate', 'zero-cost'], author: 'system' });
    this.createDoc({ title: 'Agent Communication Protocol', type: 'reference', content: 'Agents communicate via Guardian AI\'s zero-trust token system. All inter-agent requests require a 500ms TTL token issued by Guardian. Context declarations are mandatory.', tags: ['agents', 'security', 'tokens'], author: 'system' });
  }
}

export const knowledgeBase = new KnowledgeBase();