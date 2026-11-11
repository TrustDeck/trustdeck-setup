---
summary: Create a project
permissions: [global project:create]
responses:
  201: Created. The `Location` header points to the new project.
  200: The project already exists; it is returned.
  400: Name or abbreviation is missing, the abbreviation contains other characters than `a-z A-Z 0-9 _ -`, or the end date is before the start date.
  422: Creation failed.
---
Creates a project. The abbreviation identifies the project in all URLs
(`/api/projects/{projectAbbreviation}/...`) and cannot be changed later.

Without dates, the project is valid for 10 years from now. `storeEntities`
and `storePseudonyms` default to `true`. You get all permissions on the new
project.
