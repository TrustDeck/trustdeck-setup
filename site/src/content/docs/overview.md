---
title: What is TrustDeck?
description: Purpose, capabilities, components and deployment model.
---

TrustDeck is an open-source identity management and pseudonymization platform designed for research and data processing environments. This page summarizes the system's purpose, core capabilities, major components, technology stack, and deployment model.

## At a glance

- **One service, two modules.** ACE handles pseudonyms and domains, KING handles projects and entities.
- **Domains carry the rules.** Prefix, algorithm and validity are set per domain and inherited down a domain tree.
- **Fine-grained permissions.** Every action is checked per project, domain or entity type.
- **Everything is audited.** All API requests are logged with who did what, when and from where.

## What is TrustDeck?

TrustDeck is a **Spring Boot** service that provides **pseudonymization** and **identity/entity management** features with integrated security and auditability. It is designed for:

- Trusted third party / admin workflows (interactive use)
- Automated processing pipelines (programmatic REST usage)

TrustDeck exposes a **REST API**, authenticates requests using **OIDC/JWT** (Keycloak), and persists data in **PostgreSQL**.

## Key capabilities

| Capability | Description |
|---|---|
| Pseudonymization | Generate pseudonyms from identifiers using configurable algorithms (e.g., cryptographic hashing, random generation, sequential schemes) with domain-specific settings. |
| Domain hierarchy | Semantically cluster pseudonyms and organize pseudonymization rules in a tree of domains with inheritance of configuration properties. |
| Entity management | Register and manage entities using flexible type definitions (schema-driven). |
| Access control | OAuth2/OIDC authentication with Keycloak; fine-grained permissions per project, domain and entity type, stored in TrustDeck. |
| Auditing | All API requests are automatically logged with who did what, when, and from where, enabling reliable traceability and data-state reconstruction. |
| Integration | REST-first design for integration into data pipelines and other services. |

## Core modules: ACE and KING

TrustDeck contains two main functional areas that run within the same application.

### ACE (pseudonymization / confidentiality engine)

The Advanced Confidentiality Engine (ACE) focuses on pseudonymization driven by domain configuration.

Typical responsibilities:

- Create and maintain domains (with inheritance)
- Generate pseudonyms for identifiers within a domain
- Support bulk/batch pseudonym operations
- Support cross-domain linking

### KING (entity and project management)

The Key Index of Names and General Identification Numbers (KING) component focuses on **projects** and **entities**, enabling structured registration and lifecycle management.

Typical responsibilities:

- Manage projects as containers for domains and entities
- Define entity types (schema-driven)
- Register entity instances and manage their lifecycle

## High-level architecture

TrustDeck follows a layered design:

- **REST API layer**: exposes endpoints for domain management, pseudonym operations, and entity/project operations.
- **Security layer**: validates JWT tokens and checks the caller's permissions for each operation.
- **Business services**: implement core rules (domain configuration, pseudonym generation, entity/project handling).
- **Pseudonymization engine**: selects and executes the configured pseudonymization algorithm based on domain settings.
- **Persistence and caching**: uses PostgreSQL for durable storage and an in-memory cache for performance-sensitive lookups.

## Technology stack

Java 21 · Spring Boot · PostgreSQL · jOOQ · Keycloak

## Ways to use TrustDeck

| Way | For |
|---|---|
| [REST API](/trustdeck-setup/rest-api/authentication/) | Integration into applications and data pipelines, from any language |
| [Java client library](/trustdeck-setup/java-client/getting-started/) | Convenient programmatic access from Java 21+ |
| [Web interface](/trustdeck-setup/user/) | Interactive work with projects, entities and pseudonyms |

## Deployment model

TrustDeck is typically deployed as three services: the backend, PostgreSQL and Keycloak. A frontend can be added as a fourth service.

Two common modes exist:

- **Dev mode**: PostgreSQL and Keycloak run via Docker Compose, the backend runs locally via Maven. See [Quickstart](/trustdeck-setup/quickstart/).
- **Prod-like mode**: PostgreSQL, Keycloak and the backend all run via Docker Compose. See [Deploy](/trustdeck-setup/deploy/).

## Security model overview

TrustDeck uses the **OAuth2 Resource Server** pattern:

- Clients obtain an **access token** from Keycloak
- Clients call TrustDeck with `Authorization: Bearer <ACCESS_TOKEN>`
- TrustDeck validates the token (issuer, audience and signature keys) and checks the caller's permissions

See [Authentication](/trustdeck-setup/rest-api/authentication/).

## Security

- **Authentication:** Keycloak issues OIDC/JWT access tokens. Every endpoint except the health check requires one.
- **Token checks:** TrustDeck accepts only tokens with the configured issuer and audience and a valid signature.
- **Permissions:** stored in TrustDeck and checked on every request, per project, domain or entity type.
- **Audit trail:** all API requests are logged. Entries are kept for 10 years by default.

Details: [Authentication](/trustdeck-setup/rest-api/authentication/) · [Deploy](/trustdeck-setup/deploy/)

## Repositories

| Repository | Purpose |
|---|---|
| [trustdeck-backend](https://github.com/TrustDeck/trustdeck-backend) | Core service containing ACE, KING, and the REST API |
| [trustdeck-frontend](https://github.com/TrustDeck/trustdeck-frontend) | Optional graphical user interface |
| [trustdeck-client](https://github.com/TrustDeck/trustdeck-client) | Java client library |
| [ace-benchmark](https://github.com/TrustDeck/ace-benchmark) | Performance and scalability benchmarking |
| [trustdeck-website](https://github.com/TrustDeck/trustdeck-website) | Project website and general information |

## How to cite

If you use this software in your research, please cite the accompanying article:

> Müller A, Wündisch E, Wirth FN, Meier Zu Ummeln S, Weber J, Prasser F. **The Advanced Confidentiality Engine as a Scalable Tool for the Pseudonymization of Biomedical Data in Translational Settings: Development and Usability Study.** *J Med Internet Res.* 2025 Nov 5;27:e71822. doi:10.2196/71822. PMID: 41191920.
