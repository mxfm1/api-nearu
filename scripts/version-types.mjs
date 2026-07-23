import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const TYPES_FILE = resolve(ROOT, 'src', 'shared', 'types', 'api.d.ts');
const VERSION_FILE = resolve(ROOT, 'src', 'shared', 'types', 'VERSION');

try {
  const version = readFileSync(VERSION_FILE, 'utf8').trim();
  const types = readFileSync(TYPES_FILE, 'utf8');
  const timestamp = new Date().toISOString();

  const header = `/**
 * Auto-generated API types for NearU
 * API Version: ${version}
 * Generated: ${timestamp}
 *
 * DO NOT EDIT MANUALLY
 * Run: npm run generate:types
 */
`;

  writeFileSync(TYPES_FILE, header + types, 'utf8');
  console.log(`✅ Types versioned: v${version} @ ${timestamp}`);
} catch (e) {
  console.error(`❌ Error versioning types: ${e.message}`);
  process.exit(1);
}
