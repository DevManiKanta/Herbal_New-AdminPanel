import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ManualOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin-dashboard/calling/order/${id}`);

      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      alert("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!order) return <p className="p-6">No Order Found</p>;

  const customer = order.shipping_address_snapshot;

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
      created: "bg-yellow-100 text-yellow-600",
      shipped: "bg-blue-100 text-blue-600",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            width: 80mm;
            margin: 0;
            padding: 0;
          }

          .print-container {
            width: 80mm;
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
          }

          .no-print {
            display: none !important;
          }

          .print-header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }

          .print-section {
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
          }

          .print-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 4px;
          }

          .print-label {
            font-weight: bold;
          }

          .print-table {
            width: 100%;
            font-size: 10px;
            margin-bottom: 8px;
          }

          .print-table th,
          .print-table td {
            padding: 2px 4px;
            text-align: left;
            border-bottom: 1px solid #000;
          }

          .print-table th {
            font-weight: bold;
            background: #f0f0f0;
          }

          .print-total {
            font-weight: bold;
            font-size: 13px;
            text-align: right;
            margin-top: 8px;
          }

          .print-footer {
            text-align: center;
            font-size: 10px;
            margin-top: 8px;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
        }
      `}</style>

      <div className="p-6 space-y-6">
        {/* 🔙 Header */}
        <div className="flex justify-between items-center no-print">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Back
          </button>

          <div className="text-right">
            <h2 className="text-2xl font-bold">{order.invoice_number}</h2>
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Print Container */}
        <div className="print-container">
          {/* Header */}
          <div className="print-header">
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>
              Sri Devi Herbal
            </div>
            <div style={{ fontSize: "10px" }}>Invoice</div>
            <div style={{ fontSize: "10px", marginTop: "4px" }}>
              {order.invoice_number}
            </div>
          </div>

          {/* Customer Info */}
          <div className="print-section">
            <div className="print-row">
              <span className="print-label">Customer:</span>
              <span>{customer?.name}</span>
            </div>
            <div className="print-row">
              <span className="print-label">Phone:</span>
              <span>{customer?.phone}</span>
            </div>
            {customer?.address && (
              <div style={{ fontSize: "10px", marginTop: "4px" }}>
                <span className="print-label">Address:</span>
                <div>{customer?.address}</div>
                <div>
                  {customer?.city}, {customer?.state} - {customer?.pincode}
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Item</th>
                <th style={{ width: "15%" }}>Qty</th>
                <th style={{ width: "20%" }}>Price</th>
                <th style={{ width: "25%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ width: "40%" }}>{item.product_name}</td>
                  <td style={{ width: "15%" }}>{item.quantity}</td>
                  <td style={{ width: "20%" }}>₹{item.price}</td>
                  <td style={{ width: "25%" }}>₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="print-section">
            <div className="print-row">
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount_total > 0 && (
              <div className="print-row">
                <span>Discount:</span>
                <span>-₹{order.discount_total}</span>
              </div>
            )}
            {order.tax_total > 0 && (
              <div className="print-row">
                <span>Tax:</span>
                <span>₹{order.tax_total}</span>
              </div>
            )}
            <div className="print-row" style={{ fontSize: "13px", fontWeight: "bold" }}>
              <span>Total:</span>
              <span>₹{order.grand_total}</span>
            </div>
            <div className="print-row">
              <span>Paid:</span>
              <span>₹{order.paid_amount}</span>
            </div>
            {order.change_amount > 0 && (
              <div className="print-row">
                <span>Change:</span>
                <span>₹{order.change_amount}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="print-footer">
            <div>Thank you for your purchase!</div>
            <div style={{ marginTop: "4px" }}>
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* 🧍 Customer Card - Screen Only */}
        <div className="bg-white shadow rounded p-6 no-print">
          <h3 className="text-lg font-semibold mb-4">Customer Details</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{customer?.name}</p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{customer?.phone}</p>
            </div>

            <div className="col-span-2">
              <p className="text-gray-500">Address</p>
              <p className="font-medium">
                {customer?.address}, {customer?.city}, {customer?.state} -{" "}
                {customer?.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* 🛍 Products - Screen Only */}
        <div className="bg-white shadow rounded overflow-hidden no-print">
          <h3 className="text-lg font-semibold p-6">Order Items</h3>

          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Variant</th>
                <th className="p-3">Price</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={item.product_image}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />
                    <span>{item.product_name}</span>
                  </td>
                  <td className="p-3">{item.variant_name}</td>
                  <td className="p-3">₹ {item.price}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">₹ {item.discount}</td>
                  <td className="p-3 font-semibold">₹ {item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 💰 Summary Card - Screen Only */}
        <div className="bg-white shadow rounded p-6 max-w-md ml-auto no-print">
          <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹ {order.subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>₹ {order.discount_total}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹ {order.tax_total}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Grand Total</span>
              <span>₹ {order.grand_total}</span>
            </div>

            <div className="flex justify-between">
              <span>Paid</span>
              <span>₹ {order.paid_amount}</span>
            </div>

            <div className="flex justify-between">
              <span>Change</span>
              <span>₹ {order.change_amount}</span>
            </div>
          </div>
        </div>

        {/* 🖨 Print Button - Screen Only */}
        <div className="text-right no-print">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </>
  );
}
