const { redis, sessionKey, touch, bumpVersion, readJson, getMetaOrNotFound } = require('../../../_lib');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'method_not_allowed' });
  const { id, personaId } = req.query;
  const key = sessionKey(id);

  const meta = await getMetaOrNotFound(res, id);
  if (!meta) return;
  if (meta.closed) return res.status(423).json({ error: 'closed' });

  const exists = await redis.hexists(key, `persona:${personaId}`);
  if (!exists) return res.status(404).json({ error: 'not_found' });

  let body;
  try { body = await readJson(req); } catch { return res.status(400).json({ error: 'bad_json' }); }

  if (body.deleted) {
    await redis.hdel(key, `persona:${personaId}`);
  } else {
    const persona = {
      id: Number(personaId),
      name: body.name || '',
      emoji: body.emoji || '🐵',
      items: Array.isArray(body.items) ? body.items : []
    };
    await redis.hset(key, { [`persona:${personaId}`]: JSON.stringify(persona) });
  }

  await bumpVersion(id);
  await touch(id);
  res.status(200).json({ ok: true });
};
