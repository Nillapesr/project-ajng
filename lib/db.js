import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();

const BOT_LIST_KEY = 'bots:list';
const botKey = (id) => `bot:${id}`;
const botLogKey = (id) => `bot:${id}:logs`;

export async function listBots() {
  const ids = (await kv.smembers(BOT_LIST_KEY)) || [];
  if (ids.length === 0) return [];
  const bots = await Promise.all(ids.map((id) => kv.get(botKey(id))));
  return bots.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getBot(id) {
  return kv.get(botKey(id));
}

export async function saveBot(bot) {
  await kv.set(botKey(bot.id), bot);
  await kv.sadd(BOT_LIST_KEY, bot.id);
  return bot;
}

export async function deleteBot(id) {
  await kv.del(botKey(id));
  await kv.del(botLogKey(id));
  await kv.srem(BOT_LIST_KEY, id);
}

export async function pushLog(id, entry) {
  const key = botLogKey(id);
  await kv.lpush(key, JSON.stringify({ ...entry, at: Date.now() }));
  await kv.ltrim(key, 0, 49); // simpan 50 log terakhir saja
}

export async function getLogs(id) {
  const raw = (await kv.lrange(botLogKey(id), 0, 49)) || [];
  return raw.map((r) => (typeof r === 'string' ? JSON.parse(r) : r));
}
