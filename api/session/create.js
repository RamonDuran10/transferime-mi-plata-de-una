const { redis, TTL_SECONDS, genId, sessionKey, readJson } = require('../_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  let body;
  try { body = await readJson(req); } catch { return res.status(400).json({ error: 'bad_json' }); }

  const total = body.total || '';
  const pct = body.pct || '';
  const currency = body.currency || '';
  const shared = Array.isArray(body.shared) ? body.shared : [];

  let id = genId(6);
  for (let attempts = 0; attempts < 5; attempts++) {
    const exists = await redis.exists(sessionKey(id));
    if (!exists) break;
    id = genId(6);
  }

  const key = sessionKey(id);
  const fields = {
    meta: JSON.stringify({ total, pct, currency, createdAt: Date.now(), closed: false }),
    personaSeq: 0,
    sharedSeq: shared.length,
    version: 1
  };
  shared.forEach((item, idx) => {
    const itemId = idx + 1;
    fields[`shared:${itemId}`] = JSON.stringify({ id: itemId, name: item.name || '', price: item.price || '' });
  });

  await redis.hset(key, fields);
  await redis.expire(key, TTL_SECONDS);

  res.status(200).json({ sessionId: id });
};
