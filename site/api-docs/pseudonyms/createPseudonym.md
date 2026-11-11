---
summary: Create a pseudonym
permissions: [domain pseudonym:create]
responses:
  201: Created.
  200: The identifier already has a pseudonym in this domain; it is returned.
  404: The domain does not exist.
  422: The identifier item is missing, the domain's validity period has ended, the supplied pseudonym is already taken, or storing failed.
  500: Generating the pseudonym failed.
  507: The domain is full. Random generation only produced pseudonyms that already exist.
---
Creates a pseudonym for an identifier (`identifierItem.identifier` and
`identifierItem.idType`).

- Without `psn` in the request, TrustDeck generates the pseudonym and puts the
  domain prefix in front. `omitPrefix=true` leaves the prefix out.
- With `psn`, the given pseudonym is stored as it is (trimmed, no prefix added).
