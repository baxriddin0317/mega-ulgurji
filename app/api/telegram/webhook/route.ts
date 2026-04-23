import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { handleUpdate } from '@/lib/telegram/handlers';
import type { TelegramUpdate } from '@/lib/telegram/types';

/** Constant-time string comparison to avoid leaking the expected secret
 *  length / prefix via timing side channel. */
function safeEqual(a: string | null, b: string | null): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  // Refuse if the secret isn't configured — prevents the rogue "no-secret"
  // bypass where a deploy with a missing env var accepts every webhook.
  if (!expectedSecret || !safeEqual(secret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const update: TelegramUpdate = await req.json();

    // Await the handler so Vercel's serverless runtime does not tear down
    // the container mid-execution. Prior code used fire-and-forget with
    // `.catch()`; Telegram would see 200 and mark delivery "successful"
    // while handleUpdate's Firestore reads + sendMessage calls were killed
    // before they finished, so /start silently never replied.
    //
    // Telegram allows up to 60 s for a webhook response, and our handlers
    // finish well under 3 s in practice.
    try {
      await handleUpdate(update);
    } catch (handlerErr) {
      // Log but still 200 — Telegram would otherwise flood retries for
      // an error we're already aware of.
      console.error('[telegram-webhook] handler error:', handlerErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[telegram-webhook] parse error:', error);
    return NextResponse.json({ ok: true }); // Still return 200 to prevent retries
  }
}

// Telegram sends GET to verify webhook is alive
export async function GET() {
  return NextResponse.json({
    status: 'MegaHome Telegram Bot Webhook',
    active: true,
  });
}
