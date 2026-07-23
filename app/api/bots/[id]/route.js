import { NextResponse } from 'next/server';
import { getBot, saveBot, deleteBot, getLogs } from '@/lib/db';
import { deleteWebhook } from '@/lib/botEngine';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const bot = await getBot(params.id);
  if (!bot) return NextResponse.json({ error: 'Bot tidak ditemukan' }, { status: 404 });
  const logs = await getLogs(params.id);
  return NextResponse.json({ bot: { ...bot, token: undefined }, logs });
}

export async function PATCH(req, { params }) {
  const bot = await getBot(params.id);
  if (!bot) return NextResponse.json({ error: 'Bot tidak ditemukan' }, { status: 404 });

  const body = await req.json();
  const updated = {
    ...bot,
    welcomeMessage: body.welcomeMessage ?? bot.welcomeMessage,
    fallbackMessage: body.fallbackMessage ?? bot.fallbackMessage,
    rules: body.rules ?? bot.rules,
    status: body.status ?? bot.status,
  };

  await saveBot(updated);
  return NextResponse.json({ bot: { ...updated, token: undefined } });
}

export async function DELETE(req, { params }) {
  const bot = await getBot(params.id);
  if (bot) await deleteWebhook(bot.token);
  await deleteBot(params.id);
  return NextResponse.json({ ok: true });
}
