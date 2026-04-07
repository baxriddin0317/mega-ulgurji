import { telegram } from '../bot';
import { getDb } from '../admin-app';
import { formatNasiyaSummary } from '../formatter';
import { mainMenuKeyboard } from '../keyboards';

export async function handleNasiya(chatId: number): Promise<void> {
  const db = getDb();

  const userSnap = await db.collection('telegramUsers')
    .where('chatId', '==', chatId)
    .limit(1)
    .get();

  if (userSnap.empty) {
    await telegram.sendMessage(chatId, '❌ Avval hisobingizni ulang: /start');
    return;
  }

  const userUid = userSnap.docs[0].data().userUid;
  if (!userUid) {
    await telegram.sendMessage(chatId, '❌ Hisob ulanmagan.');
    return;
  }

  const nasiyaSnap = await db.collection('nasiya')
    .where('userId', '==', userUid)
    .get();

  const records = nasiyaSnap.docs.map((d) => {
    const data = d.data();
    return {
      originalAmount: data.originalAmount || 0,
      remainingAmount: data.remainingAmount || 0,
      status: data.status || 'active',
      dueDate: data.dueDate?.toDate?.()?.toLocaleDateString('uz-UZ'),
    };
  });

  await telegram.sendMessage(chatId, formatNasiyaSummary(records), {
    replyMarkup: mainMenuKeyboard(),
  });
}
