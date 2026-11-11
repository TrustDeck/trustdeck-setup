---
summary: Empty a database table
permissions: [global table:delete]
responses:
  200: The table was emptied.
  400: This table may not be emptied.
  500: Emptying failed, e.g. because other tables still refer to its rows.
---
> **Warning:** deletes **all rows** of the table. For operators only.

Only TrustDeck's data tables can be emptied: `algorithm`, `domain`, `entity`,
`entity_type`, `linkage_token`, `permission_grant`, `project`, `project_image`,
`pseudonym`. The audit trail cannot be removed through the API. Afterwards,
the permission caches are cleared.
