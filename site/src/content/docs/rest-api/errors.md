---
title: Errors and status codes
description: What TrustDeck's error responses look like and what the common status codes mean.
---

The status codes on this page can occur on almost every endpoint, so the [API reference](/trustdeck-setup/rest-api/reference/) only lists them where they mean something specific.

## Error body

Most errors return the status as a small JSON object:

```json
{ "statusCode": 422, "statusMessage": "Unprocessable Entity" }
```

With `Accept: text/plain` the same information comes as text: `422 Unprocessable Entity`. TrustDeck answers in JSON or plain text only; without a supported `Accept` header it uses JSON.

`401` and `403` are the exception: their body is just the text `UNAUTHORIZED` or `FORBIDDEN`.

## Common status codes

**`401 Unauthorized`**: no token, or the token is invalid: expired, wrong issuer, missing audience `trustdeck`, or a bad signature. The response has the header `WWW-Authenticate: Bearer`. See [Troubleshooting](/trustdeck-setup/rest-api/authentication/#troubleshooting).

**`403 Forbidden`**: the token is valid, but you lack the permission for this action on this resource. Each endpoint in the API reference names the permission it needs. `GET /api/permissions/me` shows what you have.

**`400 Bad Request`**: a required parameter is missing or has an invalid value.

**`404 Not Found`**: the project, domain, entity type or entity in the path does not exist, or a lookup found nothing.

**`410 Gone`**: the resource exists but can no longer be used: the project has ended, the entity type is deprecated, the entity is deleted, or the domain is outside its validity period.

**`422 Unprocessable Entity`**: the request is well-formed but cannot be carried out, for example because required fields in the body are missing or storing failed.

**`500 Internal Server Error`**: an unexpected error in TrustDeck. The backend log has the details.
