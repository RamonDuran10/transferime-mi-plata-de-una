// Helper compartido por las rutas de /api/session/*.
// Usa Upstash Redis (vía la integración de Vercel Marketplace) como el único
// almacenamiento compartido de la app — todo lo demás sigue siendo estático.
const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = new Redis({ url, token });

const TTL_SECONDS = 60 * 60 * 24; // 24h — se reemite en cada escritura
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function genId(len = 6) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

function sessionKey(id) {
  return `session:${id}`;
}

async function touch(id) {
  await redis.expire(sessionKey(id), TTL_SECONDS);
}

async function bumpVersion(id) {
  await redis.hincrby(sessionKey(id), 'version', 1);
}

function parseJsonField(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

async function readJson(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      if (!req.body) return {};
      try { return JSON.parse(req.body); } catch { return {}; }
    }
    return req.body;
  }
  return new Promise(resolve => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

async function getMetaOrNotFound(res, id) {
  const key = sessionKey(id);
  const metaRaw = await redis.hget(key, 'meta');
  if (!metaRaw) {
    res.status(404).json({ error: 'not_found' });
    return null;
  }
  return parseJsonField(metaRaw, {});
}

module.exports = {
  redis, TTL_SECONDS, genId, sessionKey, touch, bumpVersion,
  parseJsonField, readJson, getMetaOrNotFound
};
