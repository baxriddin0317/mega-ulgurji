import * as XLSX from 'xlsx';
import { Order, ProductT } from './types';
import { getStatusInfo } from './orderStatus';

export function exportOrdersToExcel(orders: Order[], filename = 'buyurtmalar') {
  const rows = orders.map((order, idx) => {
    const cost = (order.basketItems || []).reduce((s, i) => s + (i.costPrice || 0) * i.quantity, 0);
    const profit = (order.totalPrice || 0) - cost;
    return {
      '#': idx + 1,
      'Mijoz': order.clientName,
      'Telefon': order.clientPhone,
      'Sana': order.date?.seconds ? new Date(order.date.seconds * 1000).toLocaleString('uz-UZ') : '',
      'Holati': getStatusInfo(order.status).label,
      'Mahsulotlar soni': order.totalQuantity,
      "Sotish narxi (so'm)": order.totalPrice,
      "Tan narxi (so'm)": cost,
      "Foyda (so'm)": profit,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Buyurtmalar');

  // Items detail sheet
  const itemRows: Record<string, unknown>[] = [];
  orders.forEach((order) => {
    (order.basketItems || []).forEach((item, idx) => {
      itemRows.push({
        'Mijoz': order.clientName,
        '#': idx + 1,
        'Mahsulot': item.title,
        'Kategoriya': item.category,
        "Narxi (so'm)": Number(item.price),
        "Tan narxi (so'm)": item.costPrice || 0,
        'Soni': item.quantity,
        "Jami (so'm)": Number(item.price) * item.quantity,
        "Foyda (so'm)": (Number(item.price) - (item.costPrice || 0)) * item.quantity,
      });
    });
  });
  const ws2 = XLSX.utils.json_to_sheet(itemRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Tafsilotlar');

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportProductsToExcel(products: ProductT[], filename = 'mahsulotlar') {
  const rows = products.map((p, idx) => {
    const sellingPrice = Number(p.price);
    const costPrice = p.costPrice || 0;
    const profit = sellingPrice - costPrice;
    const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) + '%' : '0%';
    return {
      '#': idx + 1,
      'Nomi': p.title,
      'Kategoriya': p.category,
      'Subkategoriya': p.subcategory || '',
      "Sotish narxi (so'm)": sellingPrice,
      "Tan narxi (so'm)": costPrice,
      "Foyda (so'm)": profit,
      'Marja %': margin,
      'Ombor': p.stock ?? 'Belgilanmagan',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mahsulotlar');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
