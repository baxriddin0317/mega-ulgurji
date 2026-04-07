import { NextRequest, NextResponse } from 'next/server';
import { telegram } from '@/lib/telegram/bot';

export async function GET(req: NextRequest) {
  // Protect setup endpoint with a secret query param
  const secret = req.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Determine the webhook URL from the request
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;

    // Set the webhook
    const result = await telegram.setWebhook(webhookUrl, expectedSecret);

    // Get bot info
    const botInfo = await telegram.getMe();

    return NextResponse.json({
      success: true,
      webhookUrl,
      bot: botInfo.result,
      webhookResult: result,
    });
  } catch (error) {
    console.error('Telegram setup error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Setup failed',
    }, { status: 500 });
  }
}
