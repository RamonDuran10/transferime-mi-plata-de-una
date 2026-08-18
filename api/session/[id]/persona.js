const { redis, sessionKey, touch, bumpVersion, getMetaOrNotFound } = require('../../_lib');

const ANIMALS = ['🐵','🦊','🐼','🐸','🦁','🐮','🐧','🦄','🐝','🦋','🐨','🐢','🐙','🐰','🐯','🐷'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const { id } = req.query;
  const key = sessionKey(id);

  const meta = await getMetaOrNotFound(res, id);
  if (!meta) return;
  if (meta.closed) return res.status(423).json({ error: 'closed' });

  const newId = await redis.hincrby(key, 'personaSeq', 1);
  const emoji = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const persona = { id: newId, name: '', emoji, items: [], paid: false };

  await redis.hset(key, { [`persona:${newId}`]: JSON.stringify(persona) });
  await bumpVersion(id);
  await touch(id);

  res.status(200).json({ personaId: newId, emoji });
};
