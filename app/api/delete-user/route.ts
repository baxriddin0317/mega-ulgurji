import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  try {
    const token = authHeader.split('Bearer ')[1];
    const adminApp = getAdminApp();
    const decodedToken = await adminApp.auth().verifyIdToken(token);

    // Check if user has admin role in Firestore
    const userDoc = await adminApp.firestore().collection('user').doc(decodedToken.uid).get();
    return userDoc.exists && userDoc.data()?.role === 'admin';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify the requester is an authenticated admin
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { uid } = await req.json();
    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid uid' }, { status: 400 });
    }

    const adminApp = getAdminApp();
    // Delete user from Firebase Auth
    await adminApp.auth().deleteUser(uid);
    // Delete user from Firestore
    await adminApp.firestore().collection('user').doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Foydalanuvchini o\'chirishda xatolik yuz berdi' }, { status: 500 });
  }
}
