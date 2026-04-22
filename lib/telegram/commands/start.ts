import { telegram } from '../bot';
import { getDb } from '../admin-app';
import { formatWelcome } from '../formatter';
import { mainMenuKeyboard, requestContactKeyboard } from '../keyboards';
import type { TelegramUser, TelegramMessage, ReplyKeyboardRemove } from '../types';

export async function handleStart(chatId: number, from?: TelegramUser): Promise<void> {
  const db = getDb();

  // Check if already linked
  const existingSnap = await db.collection('telegramUsers')
    .where('chatId', '==', chatId)
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    const data = existingSnap.docs[0].data();
    const name = data.userName || from?.first_name || 'Foydalanuvchi';
    await telegram.sendMessage(chatId, formatWelcome(name), {
      replyMarkup: mainMenuKeyboard(),
    });
    // Update last activity
    await existingSnap.docs[0].ref.update({
      lastActivity: new Date(),
    });
    return;
  }

  // Not linked — ask for phone number
  await telegram.sendMessage(
    chatId,
    [
      `👋 Salom, <b>${from?.first_name || 'do\'stim'}</b>!`,
      '',
      '🏪 <b>MegaHome Ulgurji</b> botiga xush kelibsiz!',
      '',
      '📱 Hisobingizni ulash uchun telefon raqamingizni yuboring.',
      'Quyidagi tugmani bosing:',
    ].join('\n'),
    { replyMarkup: requestContactKeyboard() }
  );
}

export async function handleContact(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const contact = message.contact;
  if (!contact) return;

  const db = getDb();
  const phone = normalizePhone(contact.phone_number);

  // Search for user with matching phone
  const usersSnap = await db.collection('user').get();
  let matchedUser: { uid: string; name: string; phone: string; role: string } | null = null;

  for (const doc of usersSnap.docs) {
    const data = doc.data();
    const userPhone = normalizePhone(data.phone || '');
    if (userPhone === phone && phone.length >= 9) {
      matchedUser = {
        uid: doc.id,
        name: data.name || '',
        phone: data.phone || '',
        role: data.role || 'user',
      };
      break;
    }
  }

  if (!matchedUser) {
    // Remove the reply keyboard
    const removeKb: ReplyKeyboardRemove = { remove_keyboard: true };
    await telegram.sendMessage(
      chatId,
      [
        '❌ <b>Hisob topilmadi</b>',
        '',
        'Bu telefon raqam bilan ro\'yxatdan o\'tilmagan.',
        '📝 Avval saytda ro\'yxatdan o\'ting:',
        'https://megahome.uz/sign-up',
        '',
        'Ro\'yxatdan o\'tgandan so\'ng /start buyrug\'ini yuboring.',
      ].join('\n'),
      { replyMarkup: removeKb }
    );
    return;
  }

  // Create or update telegramUsers document
  const telegramUserData = {
    chatId,
    userUid: matchedUser.uid,
    phone: matchedUser.phone,
    userName: matchedUser.name,
    isAdmin: matchedUser.role === 'admin',
    linkedAt: new Date(),
    lastActivity: new Date(),
    settings: {
      orderNotifications: true,
      promotions: true,
    },
  };

  // Check if already exists (by chatId)
  const existingSnap = await db.collection('telegramUsers')
    .where('chatId', '==', chatId)
    .limit(1)
    .get();

  if (existingSnap.empty) {
    await db.collection('telegramUsers').add(telegramUserData);
  } else {
    await existingSnap.docs[0].ref.update(telegramUserData);
  }

  // Remove the reply keyboard and send welcome
  const removeKb: ReplyKeyboardRemove = { remove_keyboard: true };
  await telegram.sendMessage(chatId, '✅ Hisobingiz muvaffaqiyatli ulandi!', {
    replyMarkup: removeKb,
  });
  await telegram.sendMessage(chatId, formatWelcome(matchedUser.name), {
    replyMarkup: mainMenuKeyboard(),
  });
}

function normalizePhone(phone: string): string {
  // Extract last 9 digits (Uzbek mobile numbers)
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-9);
}
