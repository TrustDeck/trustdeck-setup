// Copies the permission actions from the backend's application.yml to api/actions.json,
// so that build-api-spec.mjs can check the permissions in api-docs/ without the backend.
//
// Usage: node scripts/extract-actions.mjs <path to application.yml>
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const applicationYml = process.argv[2];
const config = parse(readFileSync(applicationYml, 'utf8'));
const actions = config.app.permissions;

writeFileSync('api/actions.json', JSON.stringify(actions, null, 2) + '\n');
