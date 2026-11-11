---
summary: Read or search pseudonyms
permissions: [domain pseudonym:read, domain pseudonym:search]
responses:
  200: Found. A search without hits returns an empty list.
  206: The search found more than 30 pseudonyms; the first 30 are returned.
  404: The domain does not exist, or nothing matches the identifier or pseudonym.
  410: "Search only: the domain is outside its validity period."
examples:
  - label: By identifier
    code: |
      curl "https://trustdeck.example.org/api/domains/study-a-patients/pseudonyms?id=4711&idType=patient-number" \
        --header "Authorization: Bearer $TOKEN"
  - label: By pseudonym
    code: |
      curl "https://trustdeck.example.org/api/domains/study-a-patients/pseudonyms?psn=SA-J02IPWLG72J" \
        --header "Authorization: Bearer $TOKEN"
  - label: Search
    code: |
      curl "https://trustdeck.example.org/api/domains/study-a-patients/pseudonyms?query=4711" \
        --header "Authorization: Bearer $TOKEN"
---
One path, three modes. Use exactly one of these parameter combinations:

- `id` and `idType`: the pseudonym of an identifier. Needs `pseudonym:read`.
- `psn`: the record of a pseudonym. Needs `pseudonym:read`.
- `query`: full-text search over identifiers and pseudonyms. Needs `pseudonym:search`.
