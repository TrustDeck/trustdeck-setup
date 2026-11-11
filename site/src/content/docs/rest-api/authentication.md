---
title: Authentication
description: Get an access token from Keycloak, call the API, and fix 401 and 403.
---

TrustDeck is protected using **OpenID Connect (OIDC)** with **JWT access tokens** issued by **Keycloak**.
Clients call the REST API by sending an access token as a **Bearer token**.

## What you need to call the API

You need:

- A running **Keycloak** (dev or prod)
- A Keycloak **realm** for TrustDeck
- A Keycloak **client** for TrustDeck
- An **access token (JWT)** issued for that realm/client

Requests must include:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

`GET /api/health` is the only endpoint that works without a token.

## Configure TrustDeck to validate tokens

TrustDeck validates JWTs against your Keycloak realm. In your `trustdeck.env`, set these consistently:

- `KEYCLOAK_SERVER_URI`: URL at which the backend reaches Keycloak, without trailing slash. The backend loads the signing keys from `<KEYCLOAK_SERVER_URI>/realms/<realm>/protocol/openid-connect/certs`.
- `KEYCLOAK_HOSTNAME`: Keycloak's public URL. The token's issuer (`iss`) must be exactly `<KEYCLOAK_HOSTNAME>/realms/<realm>`.
- `KEYCLOAK_REALM_NAME`: realm name
- `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`: the TrustDeck client
- `KEYCLOAK_TOKEN_AUDIENCES`: comma-separated audiences. A token must contain at least one of them in its `aud` claim (default `trustdeck`).

Example for dev mode:

```bash
KEYCLOAK_SERVER_URI=http://localhost:8081
KEYCLOAK_HOSTNAME=http://localhost:8081
KEYCLOAK_REALM_NAME=development
KEYCLOAK_CLIENT_ID=trustdeck
KEYCLOAK_CLIENT_SECRET=change-me
KEYCLOAK_TOKEN_AUDIENCES=trustdeck
```

:::note
If Keycloak is behind a proxy, make sure the externally visible URL matches what Keycloak puts into the token's `iss` claim. If the issuer doesn't match, you get `401 Unauthorized`.
:::

## How authorization works

A valid token only proves who you are. What you may do is decided by **permissions stored in TrustDeck's database**. Each permission links the token's subject (`sub`) to an action on a resource.

- Permissions exist on four levels: **global** (e.g. `project:create`, `domain:create`), **project** (e.g. `project:read`), **domain** (e.g. `pseudonym:create`) and **entity type** (e.g. `entity:create`). All actions are listed in `src/main/resources/application.yml` under `app.permissions`.
- Whoever creates a project, domain or entity type automatically gets all permissions on it.
- `GET /api/permissions/me` lists your current permissions.
- Each operation in the [API reference](/trustdeck-setup/rest-api/reference/) names the permission it needs.
- The first administrator gets the global permissions from a script, see [Quickstart](/trustdeck-setup/quickstart/#4-give-yourself-permissions).

:::note[Outline: to be written with the maintainers]
- Granting permissions to others: the `/api/permissions/...` endpoints for global, project, domain and entity-type permissions, and the frontend's permission screens.
- Delegation: who may grant what (the `*:manage-permissions` actions).
- Validity: permissions expire (default 3650 days).
- Caching: permission checks are cached. Changes made directly in the database need a backend restart.
- Audit trail: the `trustdeck_groups` token claim (`Human`, `Technical`, `Unaudited`, `AuditEverything`) controls how requests are audited.
:::

## Getting an access token

### Service-to-service (client credentials)

Use this if the TrustDeck client is **confidential** and has a client secret (good for technical clients).

1. Ensure these Keycloak client settings:
   - Client authentication: on
   - Service accounts: enabled
   - The token contains the audience `trustdeck` (the example realm's client has an audience mapper for this)

2. Request a token:

```bash
KEYCLOAK_BASE=http://localhost:8081
REALM=development
CLIENT_ID=trustdeck
CLIENT_SECRET=change-me

curl -s \
  -d "grant_type=client_credentials" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  "${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/token" \
| jq -r .access_token
```

The service account of a client is a Keycloak user named `service-account-<client-id>`. It needs TrustDeck permissions like any other user.

### Users (password grant)

Use this for a Keycloak user with user name and password. The [Java client](/trustdeck-setup/java-client/getting-started/) uses it by default. The client needs *Direct Access Grants* and a client secret.

```bash
curl -s \
  -d "grant_type=password" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "username=${USERNAME}" \
  -d "password=${PASSWORD}" \
  "${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/token" \
| jq -r .access_token
```

## Calling TrustDeck with the token

```bash
BASE_URL=http://localhost:8080
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -i \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json" \
  "${BASE_URL}/api/projects"
```

If the token is accepted, you get `200` with the projects you can access, possibly an empty list. Other endpoints answer `403 Forbidden` if the permission is missing.

## Troubleshooting

### `401 Unauthorized`

Common causes:

- Missing `Authorization` header
- Token expired
- Token issuer (`iss`) does not match `<KEYCLOAK_HOSTNAME>/realms/<realm>`
- Token does not contain one of the `KEYCLOAK_TOKEN_AUDIENCES` in `aud`
- TrustDeck cannot reach Keycloak's key endpoint (network / TLS / proxy)

What to check:

- Does the request include `Authorization: Bearer ...`?
- Decode the token and compare `iss` and `aud` with your configuration.
- Can TrustDeck reach `<KEYCLOAK_SERVER_URI>/realms/<REALM>/protocol/openid-connect/certs`? This is where Keycloak publishes the public keys for JWT verification.

### `403 Forbidden`

The token is valid, but the user or client lacks the TrustDeck permission for this action.

What to check:

- `GET /api/permissions/me` with the same token. Is the action listed for this resource?
- The operation's page in the [API reference](/trustdeck-setup/rest-api/reference/) names the required permission.

## Notes for dev vs. prod

| | Dev mode | Prod-like mode |
|---|---|---|
| Backend | `http://localhost:8080` | `http://localhost:8080` |
| Keycloak | `http://localhost:8081` (no path) | `http://localhost:8081/auth` (`KEYCLOAK_RELATIVE_PATH`) |

If you use TLS and private CAs, make sure TrustDeck trusts the CA (truststore settings).
