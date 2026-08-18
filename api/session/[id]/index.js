const { redis, sessionKey, parseJsonField } = require('../../_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const { id } = req.query;
  const key = sessionKey(id);

  const data = await redis.hgetall(key);
  if (!data || Object.keys(data).length === 0) {
    return res.status(404).json({ error: 'not_found' });
  }

  const meta = parseJsonField(data.meta, {});
  const personas = [];
  const shared = [];

  for (const [field, value] of Object.entries(data)) {
    if (field.startsWith('persona:')) {
      const p = parseJsonField(value, null);
      if (p) personas.push(p);
    } else if (field.startsWith('shared:')) {
      const s = parseJsonField(value, null);
      if (s) shared.push(s);
    }
  }
  personas.sort((a, b) => a.id - b.id);
  shared.sort((a, b) => a.id - b.id);

  res.status(200).json({
    total: meta.total || '',
    pct: meta.pct || '',
    currency: meta.currency || '',
    paidPersonaId: meta.paidPersonaId ?? null,
    closed: !!meta.closed,
    version: Number(data.version) || 0,
    shared,
    personas
  });
};
