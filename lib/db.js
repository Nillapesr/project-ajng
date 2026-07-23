import { getDb } from './mongo';

export async function listBots() {
  const db = await getDb();
  const bots = await db.collection('bots').find({}).sort({ createdAt: -1 }).toArray();
  return bots.map(stripId);
}

export async function getBot(id) {
  const db = await getDb();
  const bot = await db.collection('bots').findOne({ id });
  return bot ? stripId(bot) : null;
}

export async function saveBot(bot) {
  const db = await getDb();
  await db.collection('bots').updateOne({ id: bot.id }, { $set: bot }, { upsert: true });
  return bot;
}

export async function deleteBot(id) {
  const db = await getDb();
  await db.collection('bots').deleteOne({ id });
  await db.collection('logs').deleteMany({ botId: id });
}

export async function pushLog(id, entry) {
  const db = await getDb();
  await db.collection('logs').insertOne({ botId: id, ...entry, at: Date.now() });
  const count = await db.collection('logs').countDocuments({ botId: id });
  if (count > 50) {
    const oldest = await db
      .collection('logs')
      .find({ botId: id })
      .sort({ at: 1 })
      .limit(count - 50)
      .toArray();
    await db.collection('logs').deleteMany({ _id: { $in: oldest.map((o) => o._id) } });
  }
}

export async function getLogs(id) {
  const db = await getDb();
  const logs = await db
    .collection('logs')
    .find({ botId: id })
    .sort({ at: -1 })
    .limit(50)
    .toArray();
  return logs.map(stripId);
}

function stripId(doc) {
  const { _id, ...rest } = doc;
  return rest;
}
