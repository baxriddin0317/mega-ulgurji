import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';

/**
 * Server-validated order creation.
 *
 * Why: prior to this route, clients called Firestore `addDoc` directly with a
 * client-computed totalPrice and full product snapshots. A user could tamper
 * with cart state in DevTools (`cartProducts[0].price = 1`) and pay 1 soʻm
 * for any item — Firestore rules only checked userUid ownership.
 *
 * This endpoint atomically, inside a Firestore transaction:
 *   1. Reads every referenced product
 *   2. Confirms stock >= requested quantity (else 409 + item list)
 *   3. Computes totalPrice from server-side prices
 *   4. Decrements each product's stock (reserve-on-create model)
 *   5. Creates the order doc with a server-side snapshot
 *
 * After the transaction commits it also logs stock movements (audit trail).
 * Caller must present a Firebase Bearer ID token.
 */

interface CartItemInput {
  productId: string;
  quantity: number;
}

interface RequestBody {
  items: CartItemInput[];
  clientName: string;
  clientPhone: string;
  deliveryAddress?: string;
  orderNote?: string;
  paymentMethod?: string;
  // When an admin places an order on behalf of a customer, the customer's uid
  // must be supplied here (caller must itself be admin — we verify below).
  targetUserUid?: string;
}

interface OrderBasketItem {
  id: string;
  title: string;
  price: string;
  costPrice?: number;
  category: string;
  subcategory?: string;
  description?: string;
  productImageUrl: { url: string; path: string }[];
  storageFileId?: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminApp = getAdminApp();
    let callerUid: string;
    let callerIsAdmin = false;
    try {
      const token = authHeader.split('Bearer ')[1];
      const decoded = await adminApp.auth().verifyIdToken(token);
      callerUid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = adminApp.firestore();

    // Look up caller role from Firestore (source of truth)
    const callerDoc = await db.collection('user').doc(callerUid).get();
    callerIsAdmin = callerDoc.exists && callerDoc.data()?.role === 'admin';

    // ── Input parse + validate ─────────────────────────
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { items, clientName, clientPhone, deliveryAddress, orderNote, paymentMethod, targetUserUid } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items required' }, { status: 400 });
    }
    if (items.length > 500) {
      return NextResponse.json({ error: 'Too many items' }, { status: 400 });
    }
    if (typeof clientName !== 'string' || clientName.trim().length < 1) {
      return NextResponse.json({ error: 'clientName required' }, { status: 400 });
    }
    if (typeof clientPhone !== 'string' || clientPhone.trim().length < 4) {
      return NextResponse.json({ error: 'clientPhone required' }, { status: 400 });
    }

    // Normalize and dedupe items (sum quantities for same productId)
    const merged = new Map<string, number>();
    for (const it of items) {
      if (typeof it?.productId !== 'string' || !it.productId) {
        return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
      }
      const qty = Number(it.quantity);
      if (!Number.isFinite(qty) || qty <= 0 || qty > 100_000) {
        return NextResponse.json({ error: `Invalid quantity for ${it.productId}` }, { status: 400 });
      }
      merged.set(it.productId, (merged.get(it.productId) ?? 0) + Math.floor(qty));
    }
    const normalizedItems = Array.from(merged.entries()).map(([productId, quantity]) => ({ productId, quantity }));

    // Ownership: customers can only create for themselves; admins may pass targetUserUid
    let orderUserUid = callerUid;
    if (targetUserUid && targetUserUid !== callerUid) {
      if (!callerIsAdmin) {
        return NextResponse.json({ error: 'Only admins can place orders for others' }, { status: 403 });
      }
      orderUserUid = targetUserUid;
    }

    // ── Transaction: validate stock + create order atomically ──
    type TxResult = {
      orderId: string;
      totalPrice: number;
      totalQuantity: number;
      basketItems: OrderBasketItem[];
      priceChanged: boolean;
      movements: Array<{
        productId: string;
        productTitle: string;
        quantity: number;
        stockBefore: number;
        stockAfter: number;
      }>;
    };

    let txResult: TxResult;
    try {
      txResult = await db.runTransaction(async (tx) => {
        // READS FIRST (Firestore transaction requirement)
        const productRefs = normalizedItems.map((i) => db.collection('products').doc(i.productId));
        const productSnaps = await Promise.all(productRefs.map((r) => tx.get(r)));

        const stockErrors: Array<{ productId: string; title?: string; available: number; requested: number }> = [];
        const basketItems: OrderBasketItem[] = [];
        const movements: TxResult['movements'] = [];
        let totalPrice = 0;
        let totalQuantity = 0;

        for (let i = 0; i < productSnaps.length; i++) {
          const snap = productSnaps[i];
          const { productId, quantity } = normalizedItems[i];

          if (!snap.exists) {
            stockErrors.push({ productId, available: 0, requested: quantity });
            continue;
          }
          const data = snap.data() ?? {};
          const available = typeof data.stock === 'number' ? data.stock : 0;
          if (available < quantity) {
            stockErrors.push({ productId, title: data.title, available, requested: quantity });
            continue;
          }

          const priceNum = Number(data.price);
          const linePrice = (Number.isFinite(priceNum) ? priceNum : 0) * quantity;
          totalPrice += linePrice;
          totalQuantity += quantity;

          basketItems.push({
            id: productId,
            title: String(data.title ?? ''),
            price: String(data.price ?? '0'),
            costPrice: typeof data.costPrice === 'number' ? data.costPrice : 0,
            category: String(data.category ?? ''),
            subcategory: data.subcategory ? String(data.subcategory) : undefined,
            description: data.description ? String(data.description) : undefined,
            productImageUrl: Array.isArray(data.productImageUrl) ? data.productImageUrl : [],
            storageFileId: data.storageFileId ? String(data.storageFileId) : undefined,
            quantity,
          });

          movements.push({
            productId,
            productTitle: String(data.title ?? ''),
            quantity,
            stockBefore: available,
            stockAfter: available - quantity,
          });
        }

        if (stockErrors.length > 0) {
          // Abort transaction by throwing; caught below.
          const err = new Error('Stock unavailable');
          (err as Error & { stockErrors?: typeof stockErrors }).stockErrors = stockErrors;
          throw err;
        }

        // WRITES
        for (let i = 0; i < productRefs.length; i++) {
          const { quantity } = normalizedItems[i];
          tx.update(productRefs[i], { stock: movements[i].stockAfter });
        }

        const orderRef = db.collection('orders').doc();
        tx.set(orderRef, {
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          userUid: orderUserUid,
          date: new Date(),
          status: 'yangi',
          basketItems,
          totalPrice,
          totalQuantity,
          stockReserved: true,
          ...(deliveryAddress?.trim() ? { deliveryAddress: deliveryAddress.trim() } : {}),
          ...(orderNote?.trim() ? { orderNote: orderNote.trim() } : {}),
          ...(paymentMethod ? { paymentMethod } : {}),
        });

        // Detect price drift so the UI can warn the customer
        const clientTotalHint = Number(req.headers.get('X-Client-Total-Hint'));
        const priceChanged = Number.isFinite(clientTotalHint) && clientTotalHint > 0 && clientTotalHint !== totalPrice;

        return {
          orderId: orderRef.id,
          totalPrice,
          totalQuantity,
          basketItems,
          priceChanged,
          movements,
        };
      });
    } catch (err) {
      const stockErrors = (err as Error & { stockErrors?: unknown }).stockErrors;
      if (stockErrors) {
        return NextResponse.json({ error: 'Ombordagi mahsulot yetarli emas', stockErrors }, { status: 409 });
      }
      console.error('Order create transaction failed:', err);
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
    }

    // ── Audit trail (post-commit; fire-and-forget but awaited as a batch) ──
    try {
      const ts = new Date();
      const writes = txResult.movements.map((m) =>
        db.collection('stockMovements').add({
          productId: m.productId,
          productTitle: m.productTitle,
          type: 'sotish',
          quantity: -m.quantity,
          stockBefore: m.stockBefore,
          stockAfter: m.stockAfter,
          reason: 'Buyurtma yaratildi',
          reference: txResult.orderId,
          timestamp: ts,
        }),
      );
      await Promise.all(writes);
    } catch (err) {
      console.error('stockMovement log failed (non-fatal):', err);
    }

    return NextResponse.json({
      ok: true,
      orderId: txResult.orderId,
      totalPrice: txResult.totalPrice,
      totalQuantity: txResult.totalQuantity,
      basketItems: txResult.basketItems,
      priceChanged: txResult.priceChanged,
    });
  } catch (err) {
    console.error('Order create route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
