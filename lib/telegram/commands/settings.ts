import { telegram } from '../bot';
import { getDb } from '../admin-app';
import { settingsKeyboard } from '../keyboards';

export async function handleSettings(chatId: number): Promise<void> {
  const db = getDb();
  const snap = await db.collection('telegramUsers')
    .where('chatId', '==', chatId)
    .limit(1)
    .get();

  if (snap.empty) {
    await telegram.sendMessage(chatId, '❌ Avval hisobingizni ulang: /start');
    return;
  }

  const data = snap.docs[0].data();
  const settings = data.settings || {
    orderNotifications: true,
    promotions: true,
  };

  await telegram.sendMessage(
    chatId,
    '⚙️ <b>Xabar sozlamalari</b>\n\nQaysi xabarlarni olishni xohlaysiz:',
    { replyMarkup: settingsKeyboard(settings) }
  );
}

export async function handleSettingsToggle(chatId: number, setting: string): Promise<void> {
  const validSettings = ['orderNotifications', 'promotions'];
  if (!validSettings.includes(setting)) return;

  const db = getDb();
  const snap = await db.collection('telegramUsers')
    .where('chatId', '==', chatId)
    .limit(1)
    .get();

  if (snap.empty) return;

  const docRef = snap.docs[0].ref;
  const data = snap.docs[0].data();
  const currentSettings = data.settings || {
    orderNotifications: true,
    promotions: true,
  };

  // Toggle the setting
  currentSettings[setting] = !currentSettings[setting];
  await docRef.update({ settings: currentSettings });

  // Refresh the settings display
  await telegram.sendMessage(
    chatId,
    '⚙️ <b>Xabar sozlamalari</b>\n\nQaysi xabarlarni olishni xohlaysiz:',
    { replyMarkup: settingsKeyboard(currentSettings) }
  );
}
