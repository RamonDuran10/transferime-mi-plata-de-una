const { redis, sessionKey, touch, bumpVersion, getMetaOrNotFound } = require('../../_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const { id } = req.query;
  const key = sessionKey(id);

  const meta = await getMetaOrNotFound(res, id);
  if (!meta) return;

  meta.closed = true;
  await redis.hset(key, { meta: JSON.stringify(meta) });
  await bumpVersion(id);
  await touch(id);
  res.status(200).json({ ok: true });
};
