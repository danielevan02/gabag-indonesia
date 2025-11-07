import * as XLSX from "xlsx";
import { format } from "date-fns";

interface OrderItemForExport {
  id: string;
  name: string;
  qty: number;
  price: bigint;
  productId: string;
  variantId: string | null;
  product: {
    sku: string | null;
  };
  variant: {
    sku: string | null;
  } | null;
}

interface OrderForExport {
  id: string;
  paymentStatus: string | null;
  createdAt: Date;
  user: {
    name: string | null;
  } | null;
  shippingInfo: any;
  itemsPrice: bigint;
  shippingPrice: bigint;
  discountAmount: bigint;
  totalPrice: bigint;
  voucherCodes: string[];
  orderItems: OrderItemForExport[];
}

interface ExportRow {
  order_id: string;
  order_status: string;
  order_date: string;
  customer_name: string;
  address: string;
  sub_total: number;
  voucher_code: string;
  voucher_discount: number;
  total_price: number;
  sku: string;
  product_name: string;
  qty: number;
  price: number;
}

/**
 * Generate XLSX file from orders data
 * @param orders - Array of orders with items and vouchers
 * @param startDate - Start date for filename
 * @param endDate - End date for filename
 * @returns void (downloads file automatically)
 */
export function generateOrdersXLSX(
  orders: OrderForExport[],
  startDate: string,
  endDate: string
): void {
  if (!orders || orders.length === 0) {
    throw new Error("Tidak ada order dalam rentang tanggal tersebut.");
  }

  const exportData: ExportRow[] = [];

  orders.forEach((order) => {
    const customerName = order.user?.name || "N/A";
    const shippingInfo = order.shippingInfo as { address?: string } | null;
    const address = shippingInfo?.address || "N/A";

    // Calculate sub_total = itemsPrice + shippingPrice
    const subTotal = Number(order.itemsPrice) + Number(order.shippingPrice);

    // Get voucher info
    const voucherCode = order.voucherCodes.join(", ") || "";
    const voucherDiscount = Number(order.discountAmount);

    const totalPrice = Number(order.totalPrice);
    const orderDate = format(new Date(order.createdAt), "yyyy-MM-dd");
    const orderStatus = order.paymentStatus || "N/A";

    // If order has no items, create one row with empty item data
    if (order.orderItems.length === 0) {
      exportData.push({
        order_id: order.id,
        order_status: orderStatus,
        order_date: orderDate,
        customer_name: customerName,
        address: address,
        sub_total: subTotal,
        voucher_code: voucherCode,
        voucher_discount: voucherDiscount,
        total_price: totalPrice,
        sku: "N/A",
        product_name: "N/A",
        qty: 0,
        price: 0,
      });
    } else {
      // Create a row for each order item
      order.orderItems.forEach((item) => {
        // Get SKU from variant or product
        const sku = item.variant?.sku || item.product.sku || "N/A";

        exportData.push({
          order_id: order.id,
          order_status: orderStatus,
          order_date: orderDate,
          customer_name: customerName,
          address: address,
          sub_total: subTotal,
          voucher_code: voucherCode,
          voucher_discount: voucherDiscount,
          total_price: totalPrice,
          sku: sku,
          product_name: item.name,
          qty: item.qty,
          price: Number(item.price),
        });
      });
    }
  });

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 20 }, // order_id
    { wch: 15 }, // order_status
    { wch: 12 }, // order_date
    { wch: 20 }, // customer_name
    { wch: 30 }, // address
    { wch: 12 }, // sub_total
    { wch: 15 }, // voucher_code
    { wch: 15 }, // voucher_discount
    { wch: 12 }, // total_price
    { wch: 15 }, // sku
    { wch: 30 }, // product_name
    { wch: 8 },  // qty
    { wch: 12 }, // price
  ];
  worksheet["!cols"] = columnWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  // Generate filename with date range
  const filename = `orders_export_${startDate}_to_${endDate}.xlsx`;

  // Write file and trigger download
  XLSX.writeFile(workbook, filename);
}
