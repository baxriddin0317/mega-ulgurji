import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';
import { notifyOrderConfirmed, notifyOrderStatusChanged, notifyDeliveryArriving } from '@/lib/telegram/notifications';
import { alertNewOrder, alertLowStock, alertNewUser, alertDailySummary } from '@/lib/telegram/admin-alerts';

// Notification types any authenticated user may trigger (actions related
// to their own signup / their own order).
const CUSTOMER_TYPES = new Set(['order_placed', 'new_user']);

// Notification types that must originate from an admin (dashboard alerts,
// daily summaries, arbitrary order status changes). Previously all types
// accepted any valid Firebase token, so a logged-in customer could
// craft a request to trigger admin alerts.
const ADMIN_TYPES = new Set(['order_status_changed', 'low_stock', 'daily_summary']);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const adminApp = getAdminApp();
    let callerUid: string;
    try {
      callerUid = (await adminApp.auth().verifyIdToken(authHeader.split('Bearer ')[1])).uid;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { type, data } = await req.json();

    if (ADMIN_TYPES.has(type)) {
      const callerDoc = await adminApp.firestore().collection('user').doc(callerUid).get();
      if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      }
    } else if (!CUSTOMER_TYPES.has(type)) {
      return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    switch (type) {
      case 'order_placed': {
        // Notify admin about new order
        await alertNewOrder({
          id: data.orderId || '',
          clientName: data.clientName || '',
          clientPhone: data.clientPhone || '',
          totalPrice: data.totalPrice || 0,
          totalQuantity: data.totalQuantity || 0,
          basketItems: (data.basketItems || []).map((i: { title: string; quantity: number }) => ({
            title: i.title,
            quantity: i.quantity,
          })),
        });
        // Notify customer
        if (data.userUid) {
          await notifyOrderConfirmed({
            id: data.orderId || '',
            clientName: data.clientName || '',
            totalPrice: data.totalPrice || 0,
            totalQuantity: data.totalQuantity || 0,
            basketItems: (data.basketItems || []).map((i: { title: string; quantity: number }) => ({
              title: i.title,
              quantity: i.quantity,
            })),
            userUid: data.userUid,
          });
        }
        break;
      }

      case 'order_status_changed': {
        const order = {
          id: data.orderId || '',
          clientName: data.clientName || '',
          totalPrice: data.totalPrice || 0,
          userUid: data.userUid || '',
        };
        await notifyOrderStatusChanged(order, data.newStatus);
        // Special notification for delivery
        if (data.newStatus === 'yetkazilmoqda') {
          await notifyDeliveryArriving(order);
        }
        break;
      }

      case 'new_user': {
        await alertNewUser({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
        break;
      }

      case 'low_stock': {
        await alertLowStock(
          (data.products || []).map((p: { title: string; stock: number }) => ({
            title: p.title,
            stock: p.stock,
          }))
        );
        break;
      }

      case 'daily_summary': {
        await alertDailySummary(data);
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram notify error:', error);
    return NextResponse.json({ ok: false, error: 'Notification failed' }, { status: 500 });
  }
}
