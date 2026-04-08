import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';
import { telegram } from '@/lib/telegram/bot';

export async function POST(req: NextRequest) {
  try {
    // Verify admin (require Authorization header)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    try {
      const token = authHeader.split('Bearer ')[1];
      const adminApp = getAdminApp();
      const decoded = await adminApp.auth().verifyIdToken(token);
      const userDoc = await adminApp.firestore().collection('user').doc(decoded.uid).get();
      if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const db = getAdminApp().firestore();
    const snap = await db.collection('telegramUsers').get();

    let sent = 0;
    let failed = 0;

    for (const doc of snap.docs) {
      const data = doc.data();
      if (!data.chatId) continue;

      try {
        await telegram.sendMessage(data.chatId, text);
        sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ sent, failed, total: snap.size });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 });
  }
}
