import { telegram } from '../bot';
import { getDb } from '../admin-app';
import { formatCartSummary } from '../formatter';
import { cartKeyboard, emptyCartKeyboard } from '../keyboards';
import type { CartItem } from '../types';

// In-memory cart storage (resets on server restart — acceptable for MVP)
const carts = new Map<number, CartItem[]>();

export function getCart(chatId: number): CartItem[] {
  return carts.get(chatId) || [];
}

export async function handleCart(chatId: number): Promise<void> {
  const items = getCart(chatId);
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

  const items = getCart(chatId);
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

  carts.set(chatId, items);
  await telegram.sendMessage(
    chatId,
    `✅ <b>${data.title}</b> savatchaga qo'shildi!\n\n🛒 /cart — Savatchani ko'rish`
  );
}

export async function handleRemoveFromCart(chatId: number, productId: string): Promise<void> {
  const items = getCart(chatId).filter((i) => i.productId !== productId);
  carts.set(chatId, items);
  await handleCart(chatId);
}

export async function handleUpdateCartQty(chatId: number, productId: string, delta: number): Promise<void> {
  const items = getCart(chatId);
  const item = items.find((i) => i.productId === productId);
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    return handleRemoveFromCart(chatId, productId);
  }

  // Check stock
  const db = getDb();
  const doc = await db.collection('products').doc(productId).get();
  const stock = doc.exists ? (doc.data()?.stock ?? 0) : 0;

  if (newQty > stock) {
    await telegram.sendMessage(chatId, `⚠️ Stokda faqat ${stock} ta mavjud.`);
    return;
  }

  item.quantity = newQty;
  carts.set(chatId, items);
  await handleCart(chatId);
}

export async function handleClearCart(chatId: number): Promise<void> {
  carts.delete(chatId);
  await telegram.sendMessage(chatId, '🗑 Savatcha tozalandi.', {
    replyMarkup: emptyCartKeyboard(),
  });
}

// Clear cart externally (used by order handler)
export function clearCart(chatId: number): void {
  carts.delete(chatId);
}
