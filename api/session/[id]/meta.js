const { redis, sessionKey, touch, bumpVersion, readJson, getMetaOrNotFound } = require('../../_lib');

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'method_not_allowed' });
  const { id } = req.query;
  const key = sessionKey(id);

  const meta = await getMetaOrNotFound(res, id);
  if (!meta) return;
  if (meta.closed) return res.status(423).json({ error: 'closed' });

  let body;
  try { body = await readJson(req); } catch { return res.status(400).json({ error: 'bad_json' }); }

  const newMeta = {
    total: body.total ?? meta.total ?? '',
    pct: body.pct ?? meta.pct ?? '',
    currency: body.currency ?? meta.currency ?? '',
    // undefined -> no vino en este PATCH (se conserva); null es un valor válido (nadie pagó)
    paidPersonaId: body.paidPersonaId !== undefined ? body.paidPersonaId : (meta.paidPersonaId ?? null),
    createdAt: meta.createdAt,
    closed: !!meta.closed
  };

  await redis.hset(key, { meta: JSON.stringify(newMeta) });
  await bumpVersion(id);
  await touch(id);
  res.status(200).json({ ok: true });
};
