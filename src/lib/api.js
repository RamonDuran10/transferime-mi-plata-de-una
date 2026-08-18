export async function apiCall(path, opts) {
  const res = await fetch('/api/session/' + path, opts);
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
}
