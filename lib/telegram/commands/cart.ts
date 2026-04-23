import { telegram } from '../bot';
import { getDb } from '../admin-app';
import { formatCartSummary } from '../formatter';
import { cartKeyboard, emptyCartKeyboard } from '../keyboards';
import type { CartItem } from '../types';

/**
 * Telegram-bot cart storage.
 *
 * Lives in Firestore under `telegramCarts/{chatId}` because Vercel spins
 * each bot request up in a fresh serverless instance — a module-level
 * `Map` (the previous implementation) lost every cart on cold start,
 * silently breaking the /products → /cart → /order flow in production.
 *
 * Docs are keyed by chatId (stringified) for O(1) reads/writes with no
 * index required. Default-deny rules protect the collection; Admin SDK
 * bypasses them for every function in this file.
 */

function cartRef(chatId: number) {
  return getDb().collection('telegramCarts').doc(String(chatId));
}

export async function getCart(chatId: number): Promise<CartItem[]> {
  const snap = await cartRef(chatId).get();
  return (snap.exists ? (snap.data()?.items as CartItem[] | undefined) : undefined) ?? [];
}

async function setCart(chatId: number, items: CartItem[]): Promise<void> {
  if (items.length === 0) {
    await cartRef(chatId).delete().catch(() => {});
    return;
  }
  await cartRef(chatId).set({ items, updatedAt: new Date() });
}

export async function handleCart(chatId: number, preloadedItems?: CartItem[]): Promise<void> {
  // Callers that just wrote the cart (remove / update qty) pass the new
  // items in so we skip a redundant Firestore read on every ➕/➖ tap.
  const items = preloadedItems ?? (await getCart(chatId));
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const text = formatCartSummary(items, total);

  if (items.length === 0) {
    await telegram.sendMessage(chatId, text, { replyMarkup: emptyCartKeyboard() });
  } else {
    await telegram.sendMessage(chatId, text, { replyMarkup: cartKeyboard(items) });
  }
}

export async function handleAddToCart(chatId: number, productId: string, quantity: number): Promise<void> {
  const db = getDb();
  const doc = await db.collection('products').doc(productId).get();

  if (!doc.exists) {
    await telegram.sendMessage(chatId, '❌ Mahsulot topilmadi.');
    return;
  }

  const data = doc.data()!;
  const stock = data.stock ?? 0;
  if (stock <= 0) {
    await telegram.sendMessage(chatId, '🔴 Bu mahsulot tugagan.');
    return;
  }

  const items = await getCart(chatId);
  const existing = items.find((i) => i.productId === productId);

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > stock) {
      await telegram.sendMessage(chatId, `⚠️ Stokda faqat ${stock} ta mavjud.`);
      return;
    }
    existing.quantity = newQty;
  } else {
    if (quantity > stock) {
      await telegram.sendMessage(chatId, `⚠️ Stokda faqat ${stock} ta mavjud.`);
      return;
    }
    items.push({
      productId,
      title: data.title || '',
      price: Number(data.price) || 0,
      quantity,
    });
  }

  await setCart(chatId, items);
  await telegram.sendMessage(
    chatId,
    `✅ <b>${data.title}</b> savatchaga qo'shildi!\n\n🛒 /cart — Savatchani ko'rish`,
  );
}

export async function handleRemoveFromCart(chatId: number, productId: string, currentItems?: CartItem[]): Promise<void> {
  const items = (currentItems ?? (await getCart(chatId))).filter((i) => i.productId !== productId);
  await setCart(chatId, items);
  await handleCart(chatId, items);
}

export async function handleUpdateCartQty(chatId: number, productId: string, delta: number): Promise<void> {
  const items = await getCart(chatId);
  const item = items.find((i) => i.productId === productId);
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    return handleRemoveFromCart(chatId, productId, items);
  }

  const db = getDb();
  const doc = await db.collection('products').doc(productId).get();
  const stock = doc.exists ? (doc.data()?.stock ?? 0) : 0;

  if (newQty > stock) {
    await telegram.sendMessage(chatId, `⚠️ Stokda faqat ${stock} ta mavjud.`);
    return;
  }

  item.quantity = newQty;
  await setCart(chatId, items);
  await handleCart(chatId, items);
}

export async function handleClearCart(chatId: number): Promise<void> {
  await cartRef(chatId).delete().catch(() => {});
  await telegram.sendMessage(chatId, '🗑 Savatcha tozalandi.', {
    replyMarkup: emptyCartKeyboard(),
  });
}

/** Clear cart externally (called by order confirmation). */
export async function clearCart(chatId: number): Promise<void> {
  await cartRef(chatId).delete().catch(() => {});
}
