import { NextResponse } from 'next/server';
import { getBot, saveBot, pushLog } from '@/lib/db';
import { findReply, sendTelegramMessage } from '@/lib/botEngine';

export async function POST(req, { params }) {
  const bot = await getBot(params.botId);
  if (!bot) return NextResponse.json({ ok: false }, { status: 404 });

  if (bot.status === 'paused') {
    return NextResponse.json({ ok: true }); // bot dijeda, abaikan pesan diam-diam
  }

  const update = await req.json();
  const message = update.message;

  if (!message || !message.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text;
  const from = message.from?.username || message.from?.first_name || 'unknown';

  const reply = findReply(bot, text);

  if (reply) {
    await sendTelegramMessage(bot.token, chatId, reply);
  }

  await pushLog(bot.id, { from, text, reply: reply || '(tidak ada balasan)' });

  bot.messageCount = (bot.messageCount || 0) + 1;
  await saveBot(bot);

  return NextResponse.json({ ok: true });
}

// Telegram kadang cek endpoint dengan GET saat setup, balas OK saja
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Webhook aktif' });
}
