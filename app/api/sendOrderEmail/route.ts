import { ProductT } from '@/lib/types';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { clientName, clientLastName, clientPhone, date, basketItems, totalPrice, totalQuantity } = await req.json();
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "megahomeweb@gmail.com",
      pass: "soboyxmpyibxbvzu",
    },
  });

  const orderDetails = basketItems.map((item: ProductT) => `${item.title} - ${item.quantity} ta buyurtma qilingan`).join('\n');

  const mailOptions = {
    from: "megahomeweb@gmail.com",
    to: 'megahomeweb@gmail.com',
    subject: `Yangi buyurtma: ${clientName} ${clientLastName}`,
    text: `
      Yangi buyurtma berildi! (mega ulgurji uchun)
      Buyurtma tafsilotlari:
      Ism: ${clientName} ${clientLastName}
      Telefon: ${clientPhone}
      Sana: ${new Date(date.seconds * 1000).toLocaleString()}

      Mahsulotlar:
      ${orderDetails}

      Umumiy narx: ${totalPrice}
      Umumiy miqdor: ${totalQuantity}
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: "POST so'rovi qabul qilindi" }), {
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