import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');
const OPENAPI_DIR = resolve(ROOT, 'api', 'openapi');
const BUNDLE_YAML_PATH = resolve(OPENAPI_DIR, '.bundle.yaml');
const BUNDLE_JSON_PATH = resolve(OPENAPI_DIR, '.bundle.json');
const VERSION_FILE = resolve(ROOT, 'src', 'shared', 'types', 'VERSION');

function readYaml(relPath) {
  return YAML.parse(readFileSync(resolve(OPENAPI_DIR, relPath), 'utf8'));
}

function resolvePointer(data, pointer) {
  if (!pointer || pointer === '/') return data;
  // JSON Pointer format: #/path/to/thing — strip the leading #
  const normalized = pointer.startsWith('#') ? pointer.substring(1) : pointer;
  const parts = normalized.split('/').filter(Boolean);
  let current = data;
  for (const part of parts) {
    const decoded = part.replace(/~1/g, '/').replace(/~0/g, '~');
    if (current && typeof current === 'object' && decoded in current) {
      current = current[decoded];
    } else {
      return undefined;
    }
  }
  return current;
}

function resolveInPlace(obj, root, seen = new WeakSet()) {
  if (obj === null || obj === undefined || typeof obj !== 'object') return;
  if (seen.has(obj)) return;
  seen.add(obj);

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] && typeof obj[i] === 'object' && obj[i].$ref) {
        const resolved = resolveRef(obj[i].$ref, root, seen);
        if (resolved !== undefined) {
          obj[i] = resolved;
        }
      } else if (obj[i] && typeof obj[i] === 'object') {
        resolveInPlace(obj[i], root, seen);
      }
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === 'object' && val.$ref) {
      const resolved = resolveRef(val.$ref, root, seen);
      if (resolved !== undefined) {
        obj[key] = resolved;
      }
    } else if (val && typeof val === 'object') {
      resolveInPlace(val, root, seen);
    }
  }
}

function resolveRef(ref, root, seen) {
  const hashIdx = ref.indexOf('#');
  let pointer;
  if (hashIdx === -1) {
    return undefined;
  } else {
    pointer = ref.substring(hashIdx);
  }

  const result = resolvePointer(root, pointer);
  if (result !== undefined && typeof result === 'object' && result.$ref) {
    // The resolved value is itself a $ref, resolve it too
    const innerResolved = resolveRef(result.$ref, root, seen);
    if (innerResolved !== undefined) return innerResolved;
    // If we can't resolve the inner ref, resolve in place and return
    resolveInPlace(result, root, seen);
    return result;
  }
  return result;
}

function main() {
  // Step 1: Load schema files and build flat schemas
  const schemaFiles = [
    'schemas/errors.yaml',
    'schemas/user.yaml',
    'schemas/profile.yaml',
    'schemas/catalog.yaml',
    'schemas/service.yaml',
    'schemas/event.yaml',
    'schemas/application.yaml',
    'schemas/contact.yaml',
    'schemas/message.yaml',
    'schemas/notification.yaml',
    'schemas/thread.yaml',
  ];

  const allSchemas = {};
  for (const file of schemaFiles) {
    try {
      const data = readYaml(file);
      for (const [key, val] of Object.entries(data)) {
        if (key !== 'responses') {
          allSchemas[key] = val;
        }
      }
    } catch (e) {
      console.warn(`⚠ Could not load ${file}: ${e.message}`);
    }
  }

  // Step 2: Build responses from errors.yaml
  const errorsData = readYaml('schemas/errors.yaml');
  const allResponses = errorsData.responses || {};

  // Step 3: Load path files
  const pathFiles = [
    'paths/auth.yaml',
    'paths/users.yaml',
    'paths/profiles.yaml',
    'paths/catalog.yaml',
    'paths/services.yaml',
    'paths/events.yaml',
    'paths/applications.yaml',
    'paths/scoring.yaml',
    'paths/contacts.yaml',
    'paths/messages.yaml',
    'paths/notifications.yaml',
    'paths/threads.yaml',
  ];

  const allPaths = {};
  for (const file of pathFiles) {
    try {
      const data = readYaml(file);
      Object.assign(allPaths, data);
    } catch (e) {
      console.warn(`⚠ Could not load ${file}: ${e.message}`);
    }
  }

  // Step 4: Build the spec
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'NearU API',
      version: '0.2.0',
      description: 'API de NearU — plataforma de servicios y eventos',
      contact: { name: 'NearU Team' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desarrollo local' },
      { url: 'https://api-nearu-production.up.railway.app', description: 'Producción (Railway)' },
    ],
    paths: allPaths,
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'better-auth-session' },
      },
      schemas: allSchemas,
      responses: allResponses,
    },
  };

  // Step 5: Resolve all $refs IN PLACE iteratively
  let iterations = 0;
  let hasUnresolved = true;
  while (hasUnresolved && iterations < 20) {
    const before = JSON.stringify(spec);
    resolveInPlace(spec, spec);
    const after = JSON.stringify(spec);
    hasUnresolved = before !== after;
    iterations++;
  }

  // Count remaining $refs
  const remaining = JSON.stringify(spec).match(/"\$ref"/g);
  const remainingCount = remaining ? remaining.length : 0;
  if (remainingCount > 0) {
    console.warn(`⚠ ${remainingCount} unresolved $ref(s) remaining`);
  } else {
    console.log(`🔄 Resolved all $refs in ${iterations} iteration(s)`);
  }

  // Write bundle (YAML for openapi-typescript, JSON for runtime serving)
  writeFileSync(BUNDLE_YAML_PATH, YAML.stringify(spec), 'utf8');
  writeFileSync(BUNDLE_JSON_PATH, JSON.stringify(spec, null, 2), 'utf8');
  console.log(`✅ Bundle created: ${BUNDLE_YAML_PATH}`);
  console.log(`✅ JSON bundle: ${BUNDLE_JSON_PATH}`);

  // Write version for audit
  const version = spec.info?.version || '0.0.0';
  writeFileSync(VERSION_FILE, version, 'utf8');
  console.log(`📌 API version: ${version}`);
}

main();
