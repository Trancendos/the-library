## Wave 3 — The Library: Knowledge Base Platform Module

Implements The Library as a standalone service — knowledge base, documentation management, full-text search, and version control for the Trancendos mesh.

### What's Included

**KnowledgeBase** (`src/knowledge/knowledge-base.ts`)
- Document CRUD: `createDoc`, `updateDoc`, `getDoc`, `getDocs`, `deleteDoc`
- Version control: `getVersions()`, `restoreVersion()` — full history preserved
- Full-text search with relevance scoring: title=10, tags=8, summary=5, content=2
- 8 document types: guide, reference, tutorial, architecture, runbook, adr, changelog, glossary
- 5 document statuses: draft, review, published, archived, deprecated
- `getStats()` — LibraryStats with docsByType breakdown

**3 Seed Documents**
1. Trancendos Architecture Overview (architecture, published)
2. Zero-Cost Mandate (policy/runbook, published)
3. Agent Communication Protocol (reference, published)

**REST API** (`src/api/server.ts`)
- CRUD `/docs` — document management
- GET `/docs/:id/versions` — version history
- POST `/docs/:id/restore/:version` — restore a version
- GET `/docs/search?q=` — full-text search
- GET `/stats`, `/health`, `/metrics`

**Bootstrap** (`src/index.ts`)
- Port 3013
- Pino structured logging
- Graceful shutdown (SIGTERM/SIGINT)

### Architecture
- Zero-cost mandate compliant
- Strict TypeScript ES2022
- Express + Helmet + CORS + Morgan
- Pino structured logging

### Part of Wave 3 — Platform Modules
Trancendos Industry 6.0 / 2060 Standard