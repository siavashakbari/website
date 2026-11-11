// Local maintenance helper. Never bundle or deploy the management token.
import fs from 'node:fs';
process.loadEnvFile('.env');
const ref = new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0];
const mode = process.argv[2] || 'inspect';
async function api(path, body) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`Management API ${response.status}: ${await response.text()}`);
  return response.json();
}
if (mode === 'inspect') {
  const data = await api('/database/query', { query: "select tablename from pg_tables where schemaname='public'; select id, public from storage.buckets;", read_only: true });
  console.log(JSON.stringify(data));
} else if (mode === 'query') {
  const sql = fs.readFileSync(process.argv[3], 'utf8');
  console.log(JSON.stringify(await api('/database/query', { query: sql })));
} else {
  throw new Error('Unknown operation');
}
