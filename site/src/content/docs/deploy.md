---
title: Deploy
description: Run PostgreSQL, Keycloak and the backend in Docker.
---

TrustDeck is typically deployed as three services:

- **trustdeck-backend** (Spring Boot application)
- **trustdeck-postgresql** (database)
- **trustdeck-keycloak** (OIDC provider)

Additionally, a [frontend](https://github.com/TrustDeck/trustdeck-frontend) can be added as a fourth service.

In **prod-like mode**, PostgreSQL, Keycloak and the backend all run via Docker Compose. The backend runs as a container built from the packaged JAR. To try TrustDeck on your machine, use the [Quickstart](/trustdeck-setup/quickstart/) (dev mode) instead.

## Prerequisites

- Docker with the Compose plugin
- Java 21 and Maven (the script builds the backend JAR)
- `python3` and `curl` for the permission script

## 1. Clone and configure

```bash
git clone https://github.com/TrustDeck/trustdeck-backend.git
cd trustdeck-backend
cp trustdeck.env.template trustdeck.env
```

Fill in `trustdeck.env`. Every variable is described in the template.

### Certificates

The Keycloak image imports four certificate files into its trust store at build time. Set their paths in `trustdeck.env`:

- `CHAIN_PEM_PATH`
- `RSA_CRT_PATH`
- `ECC_CRT_PATH`
- `ORGANIZATION_CA_PEM_PATH`

The paths are **relative to the repository root**, because the files are copied into the image. The build fails if a file is missing.

### Keycloak URLs

| Variable | Used for | Example |
|---|---|---|
| `KEYCLOAK_SERVER_URI` | How the backend reaches Keycloak inside the Docker network | `http://trustdeck-keycloak:8081/auth` |
| `KEYCLOAK_HOSTNAME` | Keycloak's public URL. The backend accepts only tokens whose issuer is `KEYCLOAK_HOSTNAME/realms/<realm>`. | `https://your.server.com/auth` |
| `KEYCLOAK_RELATIVE_PATH` | Path Keycloak is served under | `/auth` |

## 2. Start prod-like mode

```bash
./trustdeck.sh prod start
```

The script:

1. creates the external Docker network `trustdeck` if it does not exist,
2. starts PostgreSQL first, because the jOOQ code generation in the Maven build needs the database on `localhost:5432`,
3. builds the backend JAR (`mvn clean package -DskipTests`),
4. builds and starts Keycloak and waits until it is healthy,
5. builds and starts the backend container.

It is done when it prints `Production stack is up`. Check it with:

```bash
curl http://localhost:8080/api/health
```

## 3. Grant the first administrator

Create the administrator's user in Keycloak, then grant them all global permissions:

```bash
./src/main/resources/scripts/addInitialAdminUser.sh --username <keycloak-username>
```

The script restarts the backend container afterwards so that cached permissions are dropped. Rerunning it extends the permissions of that user.

## Stop

```bash
./trustdeck.sh prod stop
```

## Set up your reverse proxy

If required, set up your reverse proxy (e.g. nginx, Apache).

Exemplary nginx configuration that assumes Keycloak on port `8081` and the application on port `8080`:

```nginx
server {
    listen 443 ssl;
    server_name your.server.com alias.server.com;

    ssl_certificate     /path/to/server/certificates/chain.pem;
    ssl_certificate_key /path/to/server/certificates/privatekey.pem;

    # Optional (performance): OCSP stapling (needs a resolver configured)
    ssl_stapling on;
    ssl_stapling_verify on;

    ssl_prefer_server_ciphers on;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Host              $host;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_redirect off;

    # Optional: fail-fast defaults, keep connection open longer
    keepalive_timeout 100;
    proxy_connect_timeout 3;
    proxy_send_timeout    3;
    proxy_read_timeout    3;

    location /api {
        proxy_pass http://127.0.0.1:8080/api;
        proxy_read_timeout 30;
    }

    location /swagger-ui {
        proxy_pass http://127.0.0.1:8080/swagger-ui;
    }

    location /v3/api-docs {
        proxy_pass http://127.0.0.1:8080/v3/api-docs;
    }

    location /auth {
        # Might be different depending on your exact Keycloak version and setup
        proxy_pass http://127.0.0.1:8081/auth/realms/master/protocol/openid-connect/certs;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8081/auth/admin/;
    }

    location /health {
        proxy_pass http://127.0.0.1:9000/auth/health/ready;
    }

    location /js/ {
        proxy_pass http://127.0.0.1:8081/auth/js/;
    }

    location /realms/ {
        proxy_pass http://127.0.0.1:8081/auth/realms/;
    }

    location /resources/ {
        proxy_pass http://127.0.0.1:8081/auth/resources/;
    }

    location /robots.txt {
        proxy_pass http://127.0.0.1:8081/auth/robots.txt;
    }

    # Optional: forward all other requests to the frontend (if also available, assumed to be on port 8082)
    location / {
        proxy_pass http://127.0.0.1:8082/;
    }

    error_log  /var/log/nginx/error.log  error;
    access_log /var/log/nginx/access.log combined;
}
```

:::note
Remember to set the URIs in the environment file accordingly.
:::

## Quick checks

See the container state:

```bash
docker ps -a
```

Logs:

```bash
docker logs trustdeck-postgresql
docker logs trustdeck-keycloak
docker logs trustdeck-backend
```

## Administration endpoints

Two endpoints are intended for operators only and require global permissions:

- [`DELETE /api/tables/{tableName}`](/trustdeck-setup/rest-api/reference/operations/cleartable/) empties a TrustDeck data table (`table:delete`).
- [`DELETE /api/roles/{domainName}`](/trustdeck-setup/rest-api/reference/operations/deletedomainrightsandroles/) removes the rights of a domain (`roles:delete`).
