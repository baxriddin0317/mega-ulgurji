import { telegram } from '../bot';
import { getDb } from '../admin-app';
import { formatCartSummary, formatOrderNotification } from '../formatter';
import { confirmOrderKeyboard, mainMenuKeyboard } from '../keyboards';
import { getCart, clearCart, handleAddToCart } from './cart';

export async function handleOrder(chatId: number): Promise<void> {
  const db = getDb();

  // Check if user is linked
  const userSnap = await db.collection('telegramUsers')
    .where('chatId', '==', chatId)
    .limit(1)
    .get();

  if (userSnap.empty) {
    await telegram.sendMessage(chatId, '❌ Avval hisobingizni ulang: /start');
    return;
  }

  const items = getCart(chatId);
  if (items.length === 0) {
    await telegram.sendMessage(chatId, '🛒 Savatcha bo\'sh.\n\n📦 /products — Mahsulotlarni ko\'ring');
    return;
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const text = formatCartSummary(items, total);

  await telegram.sendMessage(
    chatId,
    text + '\n\n❓ <b>Buyurtmani tasdiqlaysizmi?</b>',
    { replyMarkup: confirmOrderKeyboard() }
  );
}

export async function handleConfirmOrder(chatId: number): Promise<void> {
  const db = getDb();

  // Get linked user
  const userSnap = await db.collection('telegramUsers')
    .where('chatId', '==', chatId)
    .limit(1)
    .get();

  if (userSnap.empty) {
    await telegram.sendMessage(chatId, '❌ Avval hisobingizni ulang: /start');
    return;
  }

  const telegramUser = userSnap.docs[0].data();
  const userUid = telegramUser.userUid;

  if (!userUid) {
    await telegram.sendMessage(chatId, '❌ Hisob ulanmagan. /start buyrug\'ini yuboring.');
    return;
  }

  // Get user profile
  const profileSnap = await db.collection('user').doc(userUid).get();
  if (!profileSnap.exists) {
    await telegram.sendMessage(chatId, '❌ Foydalanuvchi profili topilmadi.');
    return;
  }
  const profile = profileSnap.data()!;

  const items = getCart(chatId);
  if (items.length === 0) {
    await telegram.sendMessage(chatId, '🛒 Savatcha bo\'sh.');
    return;
  }

  // Verify stock for all items
  for (const item of items) {
    const productSnap = await db.collection('products').doc(item.productId).get();
    if (!productSnap.exists) {
      await telegram.sendMessage(chatId, `❌ "${item.title}" mahsulot topilmadi. Savatchani tekshiring.`);
      return;
    }
    const stock = productSnap.data()?.stock ?? 0;
    if (stock < item.quantity) {
      await telegram.sendMessage(
        chatId,
        `⚠️ "${item.title}" yetarli emas. Stokda: ${stock} ta, savatchada: ${item.quantity} ta.`
      );
      return;
    }
  }

  // Build basketItems in ProductT format
  const basketItems = items.map((item) => ({
    id: item.productId,
    title: item.title,
    price: String(item.price),
    quantity: item.quantity,
    productImageUrl: [],
    category: '',
    description: '',
    stock: 0,
    storageFileId: '',
  }));

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  // Create order in Firestore
  const orderData = {
    clientName: profile.name || '',
    clientPhone: profile.phone || '',
    date: new Date(),
    basketItems,
    totalPrice,
    totalQuantity,
    userUid,
    status: 'yangi',
    orderNote: 'Telegram bot orqali buyurtma',
  };

  const orderRef = await db.collection('orders').add(orderData);

  // Clear cart
  clearCart(chatId);

  // Send confirmation
  await telegram.sendMessage(
    chatId,
    formatOrderNotification({
      id: orderRef.id,
      clientName: profile.name || '',
      totalPrice,
      totalQuantity,
      basketItems: items.map((i) => ({ title: i.title, quantity: i.quantity })),
    }),
    { replyMarkup: mainMenuKeyboard() }
  );

  // Notify admin
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId) {
    const { formatNewOrderAlert } = await import('../formatter');
    await telegram.sendMessage(
      adminChatId,
      formatNewOrderAlert({
        id: orderRef.id,
        clientName: profile.name || '',
        clientPhone: profile.phone || '',
        totalPrice,
        totalQuantity,
        basketItems: items.map((i) => ({ title: i.title, quantity: i.quantity })),
      })
    );
  }
}

export async function handleCancelOrder(chatId: number): Promise<void> {
  await telegram.sendMessage(chatId, '❌ Buyurtma bekor qilindi. Savatcha saqlanib qoldi.', {
    replyMarkup: mainMenuKeyboard(),
  });
}

export async function handleReorder(chatId: number): Promise<void> {
  const db = getDb();

  // Get linked user
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
    await telegram.sendMessage(chatId, '❌ Hisob ulanmagan. /start buyrug\'ini yuboring.');
    return;
  }

  // Get last order
  const ordersSnap = await db.collection('orders')
    .where('userUid', '==', userUid)
    .orderBy('date', 'desc')
    .limit(1)
    .get();

  if (ordersSnap.empty) {
    await telegram.sendMessage(chatId, '📋 Sizda hali buyurtma yo\'q.');
    return;
  }

  const lastOrder = ordersSnap.docs[0].data();
  const basketItems = lastOrder.basketItems || [];

  // Clear current cart and add items from last order
  clearCart(chatId);
  for (const item of basketItems) {
    if (item.id) {
      await handleAddToCart(chatId, item.id, item.quantity || 1);
    }
  }

  await telegram.sendMessage(
    chatId,
    '🔄 Oxirgi buyurtmangiz savatchaga qo\'shildi!\n\n🛒 /cart — Savatchani ko\'ring'
  );
}
