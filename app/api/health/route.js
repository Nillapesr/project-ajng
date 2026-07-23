import { NextResponse } from 'next/server';
import { listBots } from '@/lib/db';

export async function GET() {
  const bots = await listBots();
  return NextResponse.json({ ok: true, activeBots: bots.length, checkedAt: Date.now() });
}
