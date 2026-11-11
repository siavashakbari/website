process.loadEnvFile('.env');
const base = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
for (const bearer of [false, true]) {
  const headers = { apikey: key };
  if (bearer) headers.Authorization = `Bearer ${key}`;
  const response = await fetch(`${base}/rest/v1/vault_content?select=revision&id=eq.1`, { headers });
  console.log(JSON.stringify({bearer, status: response.status, body: await response.json()}));
}
