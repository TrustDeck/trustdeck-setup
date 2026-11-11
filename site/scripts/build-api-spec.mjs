// Builds api/openapi.documented.json: the backend's spec (api/openapi.json) plus the
// texts in api-docs/. Run by `npm run dev` and `npm run build`; the file format is
// described in README.md. With --strict it also fails while endpoints are undescribed.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const SCOPE_TEXT = { global: '', project: ' on the project', domain: ' on the domain', 'entity-type': ' on the entity type' };

const spec = readJson('api/openapi.json');
const actions = readJson('api/actions.json');
const api = readMarkdown('api-docs/_api.md');
const pages = readEndpointPages('api-docs');
const operations = operationsById(spec);

const problems = findProblems(operations, pages, actions);

addApiInfo(spec, api);
for (const page of pages) {
  if (operations.has(page.operationId)) addPageToOperation(operations.get(page.operationId).operation, page);
}
writeFileSync('api/openapi.documented.json', JSON.stringify(spec, null, 2));

report(operations, pages, problems);

// ---------- Reading ----------

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

// A page starts with YAML front matter between two '---' lines, followed by Markdown.
function readMarkdown(file) {
  const text = readFileSync(file, 'utf8');
  const end = text.indexOf('\n---', 3);
  return { meta: parse(text.slice(3, end)) ?? {}, body: text.slice(end + 4).trim() };
}

// Each file api-docs/<group folder>/<operationId>.md describes one endpoint.
function readEndpointPages(dir) {
  const pages = [];
  for (const folder of readdirSync(dir, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    for (const name of readdirSync(`${dir}/${folder.name}`)) {
      const file = `${dir}/${folder.name}/${name}`;
      const { meta, body } = readMarkdown(file);
      pages.push({ file, operationId: name.replace(/\.md$/, ''), group: groupName(folder.name), meta, body });
    }
  }
  return pages;
}

// The folder is the group name in lower case with dashes: entity-types -> "Entity types".
function groupName(folder) {
  const words = folder.replaceAll('-', ' ');
  return words[0].toUpperCase() + words.slice(1);
}

// springdoc's spec has only HTTP methods below each path.
function operationsById(spec) {
  const operations = new Map();
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      operations.set(operation.operationId, { method: method.toUpperCase(), path, operation });
    }
  }
  return operations;
}

// ---------- Checking (changes nothing) ----------

// Finds what an update of the backend can break: endpoints without a file,
// files whose endpoint is gone, and permissions that no longer exist.
function findProblems(operations, pages, actions) {
  const problems = [];
  const documented = new Set(pages.map((page) => page.operationId));

  for (const [operationId, { method, path }] of operations) {
    if (!documented.has(operationId)) {
      problems.push(`No file for ${method} ${path}. Create api-docs/<group>/${operationId}.md`);
    }
  }
  for (const page of pages) {
    if (!operations.has(page.operationId)) {
      problems.push(`${page.file}: the spec has no operation '${page.operationId}' (renamed or removed?)`);
    }
    for (const permission of page.meta.permissions ?? []) {
      const [scope, action] = permission.split(' ');
      if (!actions[scope]?.includes(action)) {
        problems.push(`${page.file}: '${permission}' is not a permission in api/actions.json`);
      }
    }
  }
  return problems;
}

// ---------- Writing into the spec ----------

// Title, intro and groups come from api-docs/_api.md. All endpoints need a bearer token.
function addApiInfo(spec, api) {
  spec.info.title = api.meta.title;
  spec.info.description = api.body;
  spec.tags = api.meta.tags;
  delete spec.servers; // springdoc's localhost URL
  spec.security = [{ bearerAuth: [] }];
  spec.components.securitySchemes = {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Access token from the Keycloak realm of your TrustDeck instance.',
    },
  };
}

function addPageToOperation(operation, page) {
  const { summary, permissions = [], public: isPublic, responses, examples } = page.meta;

  operation.tags = [page.group]; // replaces springdoc's controller name
  operation.summary = summary;

  const description = [];
  if (isPublic) {
    operation.security = [];
    description.push('**No token needed.**');
  }
  if (permissions.length > 0) {
    const list = permissions.map((permission) => {
      const [scope, action] = permission.split(' ');
      return `\`${action}\`${SCOPE_TEXT[scope]}`;
    });
    description.push(`**${permissions.length === 1 ? 'Permission' : 'Permissions'}:** ${list.join(', ')}`);
  }
  if (page.body) description.push(page.body);
  operation.description = description.join('\n\n');

  // Replaces springdoc's generic "200 OK" with the documented status codes.
  if (responses) {
    operation.responses = {};
    for (const [code, text] of Object.entries(responses)) {
      operation.responses[code] = { description: text };
    }
  }

  // Replaces the generated request examples, e.g. where they combine parameters wrongly.
  if (examples) {
    operation['x-codeSamples'] = examples.map((example) => ({ lang: 'bash', label: example.label, source: example.code }));
  }
}

// ---------- Report ----------

function report(operations, pages, problems) {
  const current = pages.filter((page) => operations.has(page.operationId));
  const undescribed = current.filter((page) => !page.body);
  console.log(`API docs: ${current.length - undescribed.length} of ${operations.size} endpoints described`);

  if (process.argv.includes('--strict')) {
    for (const page of undescribed) console.log(`  todo: ${page.file}`);
    if (undescribed.length > 0) problems.push(`${undescribed.length} endpoints are not described yet`);
  }
  for (const problem of problems) console.error(`ERROR: ${problem}`);
  process.exitCode = problems.length > 0 ? 1 : 0;
}
