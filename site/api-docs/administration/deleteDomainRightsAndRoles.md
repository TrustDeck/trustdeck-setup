---
summary: Remove your permissions on a domain
permissions: [global roles:delete]
responses:
  200: Your permissions on the domain were removed, or you had none.
  500: The domain does not exist or removing failed.
---
Removes all permissions **of the caller** on the given domain. Permissions of
other users stay unchanged. For operators only.
