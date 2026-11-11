---
summary: Create a domain
permissions: [global domain:create]
responses:
  201: Created. The `Location` header points to the new domain.
  200: The domain already exists; it is returned.
  404: The project or the parent domain (`superDomainName`) does not exist.
  406: The domain name cannot be used in a URL.
  410: The project has already ended.
  422: "`name`, `prefix` or `projectAbbreviation` is missing, the parent domain belongs to another project, or creation failed."
---
Creates a domain in a project. `name`, `prefix` and `projectAbbreviation` are
required. With `superDomainName` the domain becomes the child of a domain in
the same project.

Settings you leave out are inherited from the parent domain or take default
values, see [Core concepts](/trustdeck-setup/concepts/#inheritance-mechanism).
You get all permissions on the new domain.
