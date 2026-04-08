import { ProductT } from '@/lib/types';
import nodemailer from 'nodemailer';
import { getAdminApp } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    // Verify the requester is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      const adminApp = getAdminApp();
      await adminApp.auth().verifyIdToken(token);
    } catch {
      return new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { clientName, clientPhone, date, basketItems, totalPrice, totalQuantity } = body;

    // Input validation
    if (!clientName || !clientPhone || !basketItems || !totalPrice) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || "megahomeweb@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD || "",
      },
    });

    const orderDetails = basketItems.map((item: ProductT) => `${item.title} - ${item.quantity} ta buyurtma qilingan`).join('\n');

    const mailOptions = {
      from: process.env.GMAIL_USER || "megahomeweb@gmail.com",
      to: process.env.GMAIL_USER || 'megahomeweb@gmail.com',
      subject: `Yangi buyurtma: ${clientName}`,
      text: `
      Yangi buyurtma berildi! (mega ulgurji uchun)
      Buyurtma tafsilotlari:
      Ism: ${clientName}
      Telefon: ${clientPhone}
      Sana: ${date?.seconds ? new Date(date.seconds * 1000).toLocaleString() : new Date().toLocaleString()}

      Mahsulotlar:
      ${orderDetails}

      Umumiy narx: ${totalPrice}
      Umumiy miqdor: ${totalQuantity}
    `,
    };

    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: "Email yuborildi" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    return new Response(JSON.stringify({ message: "Email yuborilmadi" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
