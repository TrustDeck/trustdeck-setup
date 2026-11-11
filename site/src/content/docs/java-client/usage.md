---
title: Usage
description: Project scopes, pseudonyms, domains, entities and statistics with the Java client.
---

## Project scopes

Since client 2.0.0, project-scoped resources are reached through an immutable `ProjectScope`. Calling `client.project("abbr")`, or navigating from that scope, makes no HTTP request and does not acquire a token. A scope keeps its original abbreviation after a project rename. `scope.get("other")` is the approved convenience lookup and does not rebind the scope.

```java
ProjectScope research = trustdeck.project("research");
research.domains();          // domains of the project
research.pseudonyms("dom");  // pseudonyms in one domain
research.entities("patient");// entities of one entity type
```

## Projects

```java
Project project = Project.builder()
    .name("Research project")
    .abbreviation("research")
    .storeEntities(true)
    .storePseudonyms(true)
    .build();
trustdeck.projects().create(project);
```

`trustdeck.projects().getAll()` lists the projects the user may read. `getAll(true)` lists all projects and requires the global `project:list-all` permission.

## Pseudonyms

The client offers three ways to create a pseudonym:

```java
// From an identifier item
IdentifierItem identifierItem = IdentifierItem.builder()
    .identifier("TestID1")
    .idType("TestType")
    .build();
Pseudonym created1 = research.pseudonyms("research-domain").create(identifierItem, false);

// Directly from an identifier and identifier type
Pseudonym created2 = research.pseudonyms("research-domain").create("TestID2", "TestType", false);

// With additional validity information
Pseudonym pseudonym = Pseudonym.builder()
    .identifierItem(IdentifierItem.builder()
        .identifier("TestID3")
        .idType("TestType")
        .build())
    .validFrom(LocalDateTime.now())
    .validityTime("1 week")
    .build();
Pseudonym created3 = research.pseudonyms("research-domain").create(pseudonym, false);

Pseudonym read = research.pseudonyms("research-domain").get(created1.getPsn());
```

The same services can also be used to read, update, search and delete these resources.

## Domains

```java
Domain domain = research.domains().create(Domain.builder()
    .name("research-domain")
    .prefix("RD")
    .build());
```

Project domains expose `getAll()` as `List<ProjectDomain>` summaries from the project route. Their `search(query)` method is deliberately an unfiltered alias of global `client.domains().search(query)` and adds no project query parameter.

For domain create and update calls, a missing `projectAbbreviation` is filled in on a copied payload. Blank or conflicting values are rejected locally; case-insensitive matching preserves the caller's supplied value. This context does not prove or enforce domain ownership; backend authorization remains authoritative.

## Entities

Entities are scoped by project and entity type. Build JSON payload data with Jackson and use a project entity type when creating entities:

```java
ObjectMapper mapper = new ObjectMapper();
Entity entity = new Entity();
entity.setData(mapper.valueToTree(Map.of("givenName", "Ada", "familyName", "Lovelace")));

Entity created = research.entities("patient").create(entity);
```

## Statistics

```java
ProjectStatistics projectStatistics = trustdeck.project("research").getStatistics();
SystemStatistics systemStatistics = trustdeck.system().getStatistics();
```

By default the statistics avoid scanning large tables, so they can be sampled frequently: project statistics leave the entity and pseudonym counts `null`, and system statistics report PostgreSQL's live-row estimates (`recordCountExact = false`) together with a running insert counter per table (`insertedRecordCount`). Request exact counts explicitly when needed; this scans the tables and can take long for large projects:

```java
ProjectStatistics exactProject = trustdeck.project("research").getStatistics(true);
SystemStatistics exactSystem = trustdeck.system().getStatistics(true);
```

Project statistics requires `project:statistics` on the selected project. System statistics requires the global `system:statistics` permission.
