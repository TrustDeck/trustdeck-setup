# TrustDeck

**TrustDeck** is an open-source platform for pseudonymization and identity management in medical research. It provides tools for trusted third parties and supports both interactive workflows and integration into existing research infrastructures.

This repository serves as a central entry point to the TrustDeck ecosystem, explaining its components and where to find them.

## Components

TrustDeck combines two core components in a **single backend service**:

- **ACE (Advanced Confidentiality Engine)** handles pseudonymization, including the generation and management of pseudonyms and pseudonymization domains.
- **KING (Key Index of Names and General Identification Numbers)** provides identity and entity management, including the registration and organization of entities within projects.

Both components are implemented in the [TrustDeck Backend](https://github.com/TrustDeck/trustdeck-backend).

An optional [web frontend](https://github.com/TrustDeck/trustdeck-frontend) provides a graphical interface for working with TrustDeck.

## Deployment

TrustDeck supports two deployment options:

| Option | Description |
|---|---|
| **Backend only** | Run TrustDeck as a service and access its functionality through the REST API. |
| **Backend + Frontend** | Add a graphical user interface for interactive use alongside the REST API. |

For installation and configuration, refer to the deployment instructions in the [backend repository](https://github.com/TrustDeck/trustdeck-backend). To add the web interface, follow the instructions in the [frontend repository](https://github.com/TrustDeck/trustdeck-frontend).

## Using TrustDeck

There are three ways to interact with TrustDeck:

- **Web interface:** Manage projects, entities, and pseudonyms through the graphical [TrustDeck Frontend](https://github.com/TrustDeck/trustdeck-frontend).
- **REST API:** Integrate TrustDeck into existing applications and data processing pipelines. The API reference is available in the [documentation repository](https://github.com/TrustDeck/trustdeck-docs).
- **Java Client Library:** Use the [TrustDeck Client](https://github.com/TrustDeck/trustdeck-client) for convenient programmatic access from Java applications.

## Repository Overview

| Repository | Purpose |
|---|---|
| [trustdeck-backend](https://github.com/TrustDeck/trustdeck-backend) | Core service containing ACE, KING, and the REST API |
| [trustdeck-frontend](https://github.com/TrustDeck/trustdeck-frontend) | Optional graphical user interface |
| [trustdeck-client](https://github.com/TrustDeck/trustdeck-client) | Java client library |
| [trustdeck-docs](https://github.com/TrustDeck/trustdeck-docs) | Documentation, setup guides, and API reference |
| [ace-benchmark](https://github.com/TrustDeck/ace-benchmark) | Performance and scalability benchmarking |
| [trustdeck-website](https://github.com/TrustDeck/trustdeck-website) | Project website and general information |

For more detailed information, refer to the README files and documentation provided in the respective repositories.
