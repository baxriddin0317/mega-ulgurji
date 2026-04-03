import type { Order } from "@/lib/types";
import { formatDateUz } from "@/lib/formatDate";
import { formatUZS } from "@/lib/formatPrice";

export function generateDeliverySheet(orders: Order[]) {
  const today = formatDateUz(new Date());
  const totalItems = orders.reduce((s, o) => s + o.totalQuantity, 0);

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Yetkazish varaqasi - ${today}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #1a1a1a; font-size: 13px; }
      .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #333; }
      .header h1 { font-size: 22px; margin-bottom: 4px; }
      .header h2 { font-size: 16px; font-weight: normal; color: #555; margin-bottom: 8px; }
      .header .meta { font-size: 13px; color: #666; }
      .stop { border: 1px solid #ddd; border-radius: 8px; padding: 14px; margin-bottom: 14px; page-break-inside: avoid; }
      .stop-num { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #333; color: #fff; border-radius: 50%; font-weight: bold; font-size: 13px; margin-right: 10px; }
      .customer { font-size: 16px; font-weight: bold; }
      .phone { color: #666; margin-left: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
      th { background: #f5f5f5; text-align: left; padding: 5px 8px; border: 1px solid #ddd; font-weight: 600; }
      td { padding: 5px 8px; border: 1px solid #ddd; }
      .total-row { text-align: right; font-weight: bold; margin-top: 8px; font-size: 13px; }
      .sig { display: flex; justify-content: space-between; margin-top: 14px; padding-top: 8px; border-top: 1px dashed #ccc; }
      .sig span { font-size: 11px; color: #888; }
      @media print {
        .stop { break-inside: avoid; }
        body { margin: 10px; }
      }
    </style></head><body>`;

  html += `<div class="header">
    <h1>MEGAHOME ULGURJI</h1>
    <h2>Yetkazish varaqasi</h2>
    <p class="meta"><strong>Sana:</strong> ${today} &nbsp;|&nbsp; <strong>Buyurtmalar:</strong> ${orders.length} ta &nbsp;|&nbsp; <strong>Jami mahsulotlar:</strong> ${totalItems} ta</p>
  </div>`;

  orders.forEach((order, idx) => {
    html += `<div class="stop">
      <div style="margin-bottom:8px;">
        <span class="stop-num">${idx + 1}</span>
        <span class="customer">${order.clientName}</span>
        <span class="phone">${order.clientPhone}</span>
      </div>
      <table><thead><tr><th>#</th><th>Mahsulot</th><th>Soni</th><th>Narxi</th></tr></thead><tbody>`;

    (order.basketItems || []).forEach((item, i) => {
      html += `<tr><td>${i + 1}</td><td>${item.title}</td><td>${item.quantity}</td><td>${formatUZS(Number(item.price) * item.quantity)}</td></tr>`;
    });

    html += `</tbody></table>
      <p class="total-row">Jami: ${formatUZS(order.totalPrice)}</p>
      <div class="sig">
        <span>Qabul qildi: _________________________</span>
        <span>Imzo: _________________________</span>
      </div>
    </div>`;
  });

  html += `</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
