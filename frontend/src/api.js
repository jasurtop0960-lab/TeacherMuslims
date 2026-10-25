export const setToken = (t) => (t ? localStorage.setItem('token', t) : localStorage.removeItem('token'));
export async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(localStorage.token ? { Authorization: 'Bearer ' + localStorage.token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.code || 'ERROR');
  return d;
}
