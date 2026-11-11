# TrustDeck documentation site

Source of https://trustdeck.github.io/trustdeck-setup/, built with
[Astro Starlight](https://starlight.astro.build/) and
[starlight-openapi](https://github.com/HiDeoo/starlight-openapi).

## Run locally

Needs Node 22.

```bash
npm ci
npm run dev        # http://localhost:4321/trustdeck-setup/
npm run build      # static site in dist/
```

`dev` and `build` first run `npm run api-spec`, which builds the API reference
input (see below). Restart `npm run dev` after changing `api/` or `api-docs/`.

## Where things are

| Path | Content |
|---|---|
| `src/content/docs/` | Pages, one Markdown file each. The URL follows the file path. |
| `sidebar.mjs` | Sidebars of the Developer Docs and the User Docs |
| `api/openapi.json` | REST API spec exported from the backend, not edited by hand |
| `api/actions.json` | Permission actions from the backend's `application.yml` |
| `api-docs/` | Descriptions of the REST endpoints |
| `src/components/`, `src/styles/` | Changes to Starlight's layout and look |

## Describing an endpoint

The backend's spec has no descriptions, so they live in `api-docs/`: one file
per endpoint, in the folder of its sidebar group, named after its `operationId`
(also the last part of its URL in the API reference).

```markdown
---
summary: Create a pseudonym
permissions: [domain pseudonym:create]
responses:
  201: Created.
  507: The domain is full. Random generation only produced pseudonyms that already exist.
---
What the endpoint does, in a few sentences of Markdown.
```

- `permissions`: `<scope> <action>`, with the scope `global`, `project`,
  `domain` or `entity-type`. Endpoints without a token get `public: true` instead.
- `responses`: only status codes that mean something specific for this
  endpoint. Codes all endpoints share are explained on
  `src/content/docs/rest-api/errors.md`.
- An optional `## Examples` section with code blocks (```` ```bash title="By identifier" ````)
  replaces the generated request examples.

`npm run api-spec` fails when an endpoint has no file, a file has no endpoint
(renamed or removed), a key is malformed or an action does not exist.
`npm run api-spec -- --strict` also lists the endpoints that are not described yet.

## Updating the API spec

After a backend release, run the workflow **Update API spec** (Actions tab) with
the release tag. It pushes the new spec to the branch `api-spec/<tag>`; open a
pull request from it and add or rename files in `api-docs/` where the check fails.

Locally, with Java 21 and Maven:

```bash
bash scripts/export-api-spec.sh <path to a trustdeck-backend checkout>
```

## Publishing

The workflow **Docs** builds every pull request that touches `site/` and
publishes `main` to GitHub Pages.
