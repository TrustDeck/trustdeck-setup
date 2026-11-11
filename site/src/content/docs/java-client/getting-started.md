---
title: Getting started with the Java client
description: Add the client library, configure Keycloak, and make your first calls.
---

The TrustDeck client gives Java applications synchronous access to domains, pseudonyms, projects, project images, entity types, entities, permissions, users and health.

## Requirements

- Java 21 or newer
- A running TrustDeck backend. For a local one, follow the [Quickstart](/trustdeck-setup/quickstart/) up to step 4.

| Client | Backend |
|---|---|
| **2.1.0** | v2.4.0 or newer (tested with v2.7.1). Estimated statistics need v2.5.0. |
| 2.0.0 | v2.3.0 |

The client and backend use independent version numbers.

## 1. Add the dependency

Released versions are obtained from Maven Central and do not require repository-specific credentials.

```xml
<dependency>
  <groupId>org.trustdeck</groupId>
  <artifactId>client</artifactId>
  <version>2.1.0</version>
</dependency>
```

The client logs through SLF4J but brings no logging backend. Without one you see `SLF4J(W): No SLF4J providers were found` once at startup. Add your application's logging backend, e.g. `slf4j-simple` or Logback.

## 2. Prepare Keycloak

By default the client gets its tokens with the **password grant**: a Keycloak client plus a user name and password.

The configured Keycloak client must:

- allow **Direct Access Grants** and have a **client secret**,
- put `trustdeck` into the token's audience. Since backend v2.4.0, TrustDeck only accepts access tokens whose `aud` claim contains `trustdeck`. Add an audience mapper to the configured Keycloak client: in the admin console, open **Clients → your client → Client scopes → your-client-dedicated**, choose **Configure a new mapper → Audience**, set **Included Client Audience** to `trustdeck`, and enable **Add to access token**. Without it, every request fails with `401 Unauthorized`.

The client `trustdeck` in the example realm `development` of the dev setup already meets both.

The configured user must have the TrustDeck permissions required by the operations being performed. For a local test:

1. In the Keycloak admin console (`http://localhost:8081`), switch to the realm `development`.
2. **Users → Add user**: enter a user name and save.
3. **Credentials → Set password**: enter a password and turn **Temporary** off.
4. Give the user permissions with the bootstrap script, as in [Quickstart step 4](/trustdeck-setup/quickstart/#4-give-yourself-permissions), using this user name.

## 3. Configure the client

Load the settings from environment variables or a secrets manager:

```java
TrustDeckClientConfig config = TrustDeckClientConfig.builder()
    .serviceUrl(System.getenv("TRUSTDECK_SERVICE_URL"))
    .keycloakUrl(System.getenv("TRUSTDECK_KEYCLOAK_URL"))
    .realm(System.getenv("TRUSTDECK_REALM"))
    .clientId(System.getenv("TRUSTDECK_CLIENT_ID"))
    .clientSecret(System.getenv("TRUSTDECK_CLIENT_SECRET"))
    .userName(System.getenv("TRUSTDECK_USERNAME"))
    .password(System.getenv("TRUSTDECK_PASSWORD"))
    .build();
TrustDeckClient trustdeck = new TrustDeckClient(config);
```

| Variable | Meaning | Dev setup |
|---|---|---|
| `TRUSTDECK_SERVICE_URL` | URL of the TrustDeck backend | `http://localhost:8080` |
| `TRUSTDECK_KEYCLOAK_URL` | Base URL of the Keycloak server | `http://localhost:8081` |
| `TRUSTDECK_REALM` | Keycloak realm | `development` |
| `TRUSTDECK_CLIENT_ID` | Keycloak client ID | `trustdeck` |
| `TRUSTDECK_CLIENT_SECRET` | Keycloak client secret | `KEYCLOAK_CLIENT_SECRET` from `trustdeck.env` |
| `TRUSTDECK_USERNAME`, `TRUSTDECK_PASSWORD` | Keycloak user | the user from step 2 |

## 4. Make your first calls

```java
trustdeck.projects().create(Project.builder()
    .name("Study A")
    .abbreviation("study-a")
    .build());
ProjectScope studyA = trustdeck.project("study-a");

Domain domain = studyA.domains().create(Domain.builder()
    .name("study-a-patients")
    .prefix("SA-")
    .build());

Pseudonym psn = studyA.pseudonyms(domain.getName()).create("4711", "patient-number", false);
Pseudonym read = studyA.pseudonyms(domain.getName()).get(psn.getPsn());
```

`trustdeck.project("study-a")` makes no HTTP request. It only selects the project for the following calls. Domains created through a project scope get the project's abbreviation automatically.

Whoever creates a project or domain gets all permissions on it. Another user or a service account gets `403` on these resources until they are given permissions. See [Permissions](/trustdeck-setup/java-client/permissions/).

## Other token flows

Applications that acquire tokens through another OAuth flow can provide an `AccessTokenProvider` instead of configuring Keycloak password-grant credentials:

```java
AccessTokenProvider tokenProvider = () -> acquireTokenFromApplicationAuthentication();
TrustDeckClient trustdeck = new TrustDeckClient("https://trustdeck.example.com", tokenProvider);
```

The provider must return a current bearer token whenever `getAccessToken()` is called. The audience requirement from step 2 applies to these tokens too.

The [Quickstart](/trustdeck-setup/quickstart/#5-create-a-project-a-domain-and-a-pseudonym) (tab *Java client*) shows a complete provider for a service account with the client credentials grant.

## Next steps

- [Usage](/trustdeck-setup/java-client/usage/): project scopes, pseudonyms, entities, statistics
- [Permissions](/trustdeck-setup/java-client/permissions/)
- [Javadoc 2.1.0](https://javadoc.io/doc/org.trustdeck/client/2.1.0)
- [Client repository](https://github.com/TrustDeck/trustdeck-client): source and a complete example (`mvn clean compile exec:java`)
