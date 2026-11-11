---
title: TrustDeck REST API
# Sidebar groups, in this order. Each tag has a folder with the slug of its name.
tags:
  - { name: Projects, description: Containers for domains and entities. }
  - { name: Domains, description: Groups of pseudonyms with shared rules. }
  - { name: Pseudonyms, description: Create, read, update and delete pseudonyms. }
  - { name: Entity types, description: Base and project-scoped entity type definitions. }
  - { name: Entities, description: Persons, samples or objects within a project. }
  - { name: Project images, description: Images attached to projects. }
  - { name: Permissions, description: Global, project, domain and entity-type permissions. }
  - { name: System, description: Health and statistics. }
  - { name: Administration, description: Operator-only maintenance endpoints. Destructive. }
---
REST API of the TrustDeck backend. All endpoints except `GET /api/health`
require a bearer token from your instance's Keycloak realm; see
[Authentication](/trustdeck-setup/rest-api/authentication/). Status codes that
all endpoints share are explained in
[Errors and status codes](/trustdeck-setup/rest-api/errors/).

To find a call by path, method or task, use
[All endpoints](/trustdeck-setup/rest-api/endpoints/).
