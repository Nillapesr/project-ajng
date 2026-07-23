import { NextResponse } from 'next/server';
import { listBots, saveBot } from '@/lib/db';
import { getMe, setWebhook } from '@/lib/botEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  const bots = await listBots();
  // Jangan kirim token utuh ke client, cukup 8 karakter terakhir untuk verifikasi visual
  const safe = bots.map((b) => ({ ...b, token: maskToken(b.token) }));
  return NextResponse.json({ bots: safe });
}

export async function POST(req) {
  const body = await req.json();
  const token = (body.token || '').trim();

  if (!token || !/^\d+:[\w-]+$/.test(token)) {
    return NextResponse.json(
      { error: 'Format token tidak valid. Ambil dari @BotFather, contoh: 123456:ABC-defGhi' },
      { status: 400 }
    );
  }

  const info = await getMe(token);
  if (!info.ok) {
    return NextResponse.json(
      { error: 'Token ditolak oleh Telegram. Pastikan token benar dan belum di-revoke.' },
      { status: 400 }
    );
  }

  const id = info.result.id.toString();
  const baseUrl = getBaseUrl(req);
  const webhookUrl = `${baseUrl}/api/webhook/${id}`;

  const hookResult = await setWebhook(token, webhookUrl);
  if (!hookResult.ok) {
    return NextResponse.json(
      { error: `Gagal memasang webhook: ${hookResult.description || 'unknown error'}` },
      { status: 400 }
    );
  }

  const bot = {
    id,
    token,
    username: info.result.username,
    firstName: info.result.first_name,
    status: 'active',
    createdAt: Date.now(),
    welcomeMessage: 'Halo! Bot ini sudah aktif dan siap membalas pesanmu.',
    fallbackMessage: 'Maaf, saya belum mengerti pesan itu. Ketik /help untuk lihat kata kunci yang tersedia.',
    rules: [],
    messageCount: 0,
  };

  await saveBot(bot);

  return NextResponse.json({ bot: { ...bot, token: maskToken(bot.token) } });
}

function maskToken(token) {
  if (!token) return '';
  const tail = token.slice(-6);
  return `••••••••${tail}`;
}

function getBaseUrl(req) {
  const host = req.headers.get('host');
  const proto = host?.includes('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}
