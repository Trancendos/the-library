# Trancendos / Infinity Document Taxonomy Framework

The Library is the canonical knowledge-management home for the Trancendos mesh. This taxonomy framework gives documents a shared language so architecture, financial, knowledge, security, development, wellbeing, creativity, and DevOcity materials can be discovered, governed, reviewed, and reused consistently across Infinity and the wider ecosystem.

This guide documents the human-facing use of the taxonomy. The reusable TypeScript/Zod implementation lives in `@trancendos/shared-core` as the `document-taxonomy` module.

## Purpose

The taxonomy exists to make every important document easier to classify, search, audit, and route. A document should not only have a title and body; it should also explain what kind of organisational asset it is, which parts of the ecosystem it belongs to, which governance or compliance concepts apply, who owns it, and where it sits in its lifecycle.

The framework is designed to be practical rather than decorative. It supports knowledge-base indexing, AI-assisted search, repository documentation, governance board packs, operating manuals, design records, security artefacts, service catalogues, runbooks, training content, and creative assets.

## Primary Categories

Every governed document should have exactly one primary category.

| Category | Description |
| --- | --- |
| Architectural | Structure, systems, blueprints, operating models, platform designs, design decisions, architecture-as-code, and ecosystem maps. |
| Financial | Financial records, budget models, commercial governance, service costings, financial support material, financials-as-code, and exchange/banking concepts. |
| Knowledge | Wiki articles, knowledge-base entries, reference guides, learning material, research notes, instructions, and institutional memory. |
| Security | Secure-by-design records, risk, IAM, ABAC, RBAC, OWASP, SSL, SSO, SAML, backup, compliance, and control evidence. |
| Development | Coding standards, code bases, testing frameworks, DDD, Dart, CI/CD, CLI, functions-as-code, services-as-code, and implementation guides. |
| Wellbeing | Practices, training, support, safety, accountability, NEBOSH/IOSH, operating health, and human sustainability material. |
| Creativity | Media, marketing, design, Figma solutions, assets, studio outputs, campaigns, visual systems, and creative process records. |
| DevOcity | Backend DevOps, platform operations, chaos frameworks, service reliability, dependencies, infrastructure practices, and deployment patterns. |

## Pillars and Tags

A document should include one or more pillars. Pillars describe the practical shape of the document, while tags can add project-specific or free-form search terms.

Recommended pillars include Policies, Procedures, Documentation, Templates/Schemas, Handbooks/Bibles/Cookbooks/Hymn Sheets, Training Materials, UX, UI, ARIA, Code Bases, Foundational Practices, Blueprints, Design Documents, Governance Boards, Strategy Document, Media, Marketing, Accountability, Risk, Profiling, Research, Development, Design, Database, Solutions, Dependencies, Service Offerings, Account Management, Knowledge Base, Wiki Articles, Backup, ITSM, ITIL, CompTIA, PRINCE2, Secure by Design, Dart, DDD, Testing Framework, Chaos Framework, Financial Support, Toolsets, Instructions, Guides, Job Offering/Job Description, Structure, Assets, CLI, CI/CD, CRM, Figma Solutions, Six Sigma, NEBOSH/IOSH, ISO, SSL, SSO, SAML, OWASP, IAM, ABAC, RBAC, Functions as Code, Solutions as Code, Services as Code, Design as Code, Financials as Code, Architecture as Code, and Knowledge as Code.

Pillars should be selected from the shared controlled vocabulary whenever possible. Free-form tags should be reserved for names, projects, product lines, releases, customers, repositories, or temporary discovery labels that are not part of the core taxonomy.

## Ecosystem Locations

Documents should also identify one or more ecosystem locations. Locations connect knowledge to the places where it is used or governed.

Supported locations include The Nexus, The HIVE, Arcadia, API Marketplace, The Artifactory, The Studio, Section7, Sasha's Photo Studio, The DigitalGrid, TranceFlow, TateKing, Fabulousa, The Lab, The Workshop, The Code/Chaos Party, Imaginarium, Royal Bank of Arcadia, Arcadian Exchange, The Observatory, The Library, The Academy, DocUtari, The Basement, The Spark, Infinity, The Void, The Lighthouse, Cryptex, The Ice Box, Luminous, The Town Hall, The Citadel, Think Tank, Turing's Hub, ChronosSphere/ArcStream, DevOcity, Tranquility, I-Mind, tAimra, VRAR3D, and Resonate.

For example, a secure service deployment runbook might belong to The Artifactory, DevOcity, The Library, and Infinity. A creative campaign asset guide might belong to The Studio, Sasha's Photo Studio, Fabulousa, and The Library.

## Metadata Expectations

A document record should include a stable identifier, title, summary, primary category, one or more pillars, one or more ecosystem locations, owner, lifecycle state, version, creation timestamp, update timestamp, and optional review date. Security-sensitive or externally governed records should also include classification and compliance tags.

The shared implementation supports these lifecycle states: draft, review, approved, published, deprecated, archived. In The Library, the existing document statuses of draft, review, published, archived, and deprecated map directly to the same governance model, with approved acting as a pre-publication sign-off state where needed.

Classifications should be chosen carefully. Public material can be indexed broadly. Internal material is visible inside the organisation. Confidential and restricted documents require stricter handling, especially when they include security posture, legal notes, financial information, personal data, credentials, or unreleased intellectual property.

## Suggested Library Usage

When creating a document in The Library, use the taxonomy to populate the existing `tags` field as well as any future structured metadata fields. A good practical pattern is to include the primary category, selected pillars, ecosystem locations, compliance tags, and a small number of project-specific tags.

For example, an architectural secure-by-design blueprint for Infinity could use the category `Architectural`, pillars `Blueprints`, `Secure by Design`, `Architecture as Code`, and `Governance Boards`, locations `Infinity`, `The Citadel`, `The Library`, and `The Artifactory`, classification `INTERNAL`, and compliance tags such as `ISO`, `OWASP`, `IAM`, and `RBAC`.

A knowledge article for onboarding developers into DevOcity could use the category `Knowledge`, pillars `Guides`, `Training Materials`, `CI/CD`, `Services as Code`, and `Toolsets`, locations `DevOcity`, `The Academy`, `The Library`, and `Turing's Hub`, classification `INTERNAL`, and tags such as `onboarding`, `developer-experience`, and `backend-operations`.

## Implementation Reference

The shared source-of-truth implementation is provided by `@trancendos/shared-core`:

```ts
import {
  DocumentMetadataSchema,
  buildDocumentTags,
  validateDocumentMetadata,
} from "@trancendos/shared-core";

const metadata = validateDocumentMetadata({
  id: "doc-infinity-secure-blueprint",
  title: "Infinity Secure Blueprint",
  summary: "Secure-by-design architecture and governance map for Infinity.",
  category: "Architectural",
  pillars: ["Blueprints", "Secure by Design", "Architecture as Code"],
  locations: ["Infinity", "The Library", "The Citadel"],
  classification: "INTERNAL",
  lifecycle_state: "draft",
  compliance_tags: ["OWASP", "IAM", "RBAC"],
  owner: "Architecture Guild",
  version: "0.1.0",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: ["infinity", "security", "architecture"],
});

const searchableTags = buildDocumentTags(metadata);
```

The metadata schema should be treated as the compatibility layer between repositories. The Library can present it as documentation guidance, user-facing filters, and search tags. Other repositories can use the same schema to validate repository-native documentation, API catalogue entries, service runbooks, audit evidence, or generated AI context packs.

## Governance Notes

The taxonomy should remain controlled. New categories should be rare because they affect reporting, navigation, and cross-repository compatibility. New pillars and locations can be added when there is a clear long-term knowledge-management need, but temporary project terms should usually be normal tags instead.

Documents should be reviewed on a schedule appropriate to their risk. Security, financial, architecture, DevOcity, and compliance documents should have explicit owners and review dates. Deprecated material should remain discoverable when it explains historical decisions, but it should be clearly marked so it is not mistaken for current operating guidance.

The goal is simple: every important artefact should be findable, accountable, classifiable, and reusable across Trancendos, Infinity, The Library, and the wider Luminous-MastermindAI ecosystem.