const { redis, sessionKey, touch, bumpVersion, readJson, getMetaOrNotFound } = require('../../_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const { id } = req.query;
  const key = sessionKey(id);

  const meta = await getMetaOrNotFound(res, id);
  if (!meta) return;
  if (meta.closed) return res.status(423).json({ error: 'closed' });

  let body;
  try { body = await readJson(req); } catch { return res.status(400).json({ error: 'bad_json' }); }

  const newId = await redis.hincrby(key, 'sharedSeq', 1);
  const item = { id: newId, name: body.name || '', price: body.price || '' };

  await redis.hset(key, { [`shared:${newId}`]: JSON.stringify(item) });
  await bumpVersion(id);
  await touch(id);

  res.status(200).json({ itemId: newId });
};
