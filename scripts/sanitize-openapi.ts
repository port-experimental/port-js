import fs from 'fs';
import path from 'path';

const specPath = path.resolve(process.cwd(), 'openapi.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8')) as Record<string, unknown>;

let fixCount = 0;

/**
 * Recursively walk the OpenAPI JSON tree.
 * When a value sits directly under a key named "schema" and is a primitive
 * (string or boolean) rather than a SchemaObject, replace it with a valid
 * JSON Schema object so that openapi-typescript can parse it.
 *
 * Examples from Port's spec:
 *   "schema": "object"  →  "schema": { "type": "object" }
 *   "schema": true      →  "schema": {}
 *   "schema": false     →  "schema": { "not": {} }
 */
function walk(node: unknown, parentKey: string | null, location: string): unknown {
  if (Array.isArray(node)) {
    return node.map((item, i) => walk(item, null, `${location}[${i}]`));
  }

  if (node !== null && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = walk(v, k, `${location}.${k}`);
    }
    return result;
  }

  // Leaf value — only fix if it is the direct value of a "schema" key
  if (parentKey === 'schema') {
    if (typeof node === 'string') {
      console.warn(`[sanitize] ${location}: string "${node}" → { "type": "${node}" }`);
      fixCount++;
      return { type: node };
    }
    if (typeof node === 'boolean') {
      const replacement = node ? {} : { not: {} };
      console.warn(`[sanitize] ${location}: boolean ${node} → ${JSON.stringify(replacement)}`);
      fixCount++;
      return replacement;
    }
  }

  return node;
}

const sanitized = walk(spec, null, '#');
fs.writeFileSync(specPath, JSON.stringify(sanitized, null, 2));
console.log(`[sanitize] Done — fixed ${fixCount} invalid schema value(s) in openapi.json`);
