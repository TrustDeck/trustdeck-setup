---
title: Glossary
description: The terms used in TrustDeck and its documentation.
tableOfContents: false
---

| Term | Meaning |
|---|---|
| **ACE** | Advanced Confidentiality Engine. The part of TrustDeck that handles pseudonyms and domains. See [What is TrustDeck?](/trustdeck-setup/overview/#core-modules-ace-and-king) |
| **Algorithm** | How a domain generates its pseudonyms: algorithm type, alphabet, length and check digit. See [Pseudonymization algorithms](/trustdeck-setup/concepts/#pseudonymization-algorithms) |
| **Base type** | An entity type shared across projects, e.g. a person. Projects extend it with their own attributes. See [Entity types](/trustdeck-setup/concepts/#entity-types) |
| **Check digit** | An extra character (Luhn mod n) that detects typing errors when pseudonyms are handled manually. See [Check digits](/trustdeck-setup/concepts/#check-digits-optional) |
| **Domain** | A cluster of semantically similar pseudonyms with shared rules (prefix, algorithm, validity). Belongs to a project and can have a parent domain. See [Domains](/trustdeck-setup/concepts/#domains) |
| **Entity** | A record of a real-world object such as a person, biosample or device, stored in a project. See [Entities](/trustdeck-setup/concepts/#entities) |
| **Entity type** | The schema an entity follows: which fields it has and how they are validated. See [Entity types](/trustdeck-setup/concepts/#entity-types) |
| **Identifier** | The original value that is pseudonymized, e.g. `4711`. See [Identifier structure](/trustdeck-setup/concepts/#identifier-structure) |
| **idType** | The kind of identifier, e.g. `patient-number`. Identifier and idType together are mapped to a pseudonym. |
| **KING** | Key Index of Names and General Identification Numbers. The part of TrustDeck that handles projects and entities. See [What is TrustDeck?](/trustdeck-setup/overview/#core-modules-ace-and-king) |
| **Linked pseudonyms** | A chain of pseudonyms across the levels of a domain tree, where the pseudonym of one level is the identifier of the next. See [Cross-domain linking](/trustdeck-setup/concepts/#cross-domain-pseudonym-linking) |
| **Permission** | An action a user may perform on a resource, e.g. `pseudonym:create` on a domain. Stored in TrustDeck. See [How authorization works](/trustdeck-setup/rest-api/authentication/#how-authorization-works) |
| **Prefix** | A string put in front of every pseudonym of a domain, e.g. `SA-`. |
| **Project** | The top-level container for domains and entities, addressed by its abbreviation in all URLs. See [Projects](/trustdeck-setup/concepts/#projects) |
| **PSN** | Short for pseudonym. The API field is called `psn`. |
| **TrustDeck ID** | The identifier TrustDeck assigns to an entity. Used in URLs as `{trustDeckId}`. |
