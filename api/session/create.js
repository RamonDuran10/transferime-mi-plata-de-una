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
    meta: JSON.stringify({ total, pct, currency, paidPersonaId: null, createdAt: Date.now(), closed: false }),
    personaSeq: 0,
    sharedSeq: shared.length,
    version: 1
  };
  shared.forEach((item) => {
    // se preserva el id que ya trae el cliente (en vez de reasignar uno nuevo
    // acá) — si no, el próximo PUT desde el host usa el id viejo y crea una
    // entrada duplicada en vez de actualizar esta misma
    const itemId = item.id;
    fields[`shared:${itemId}`] = JSON.stringify({
      id: itemId, name: item.name || '', price: item.price || '',
      participantIds: Array.isArray(item.participantIds) ? item.participantIds : []
    });
  });

  await redis.hset(key, fields);
  await redis.expire(key, TTL_SECONDS);

  res.status(200).json({ sessionId: id });
};
