

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_OPTIONS = ["confirmed", "packing", "shipping", "delivered"];

export default function POSOrders() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  /* ================= LOCAL COURIER ================= */
  const [localOpen, setLocalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [localCourier, setLocalCourier] = useState({
    partner: "",
    awb: "",
    tracking_url: "",
    shipping_amount: "",
  });

  /* ================= FETCH ORDERS ================= */
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/orders");
      setOrders(res.data.data || []);
    } catch (e) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ================= SHIPROCKET ================= */
  const sendToShiprocket = async (orderId) => {
    if (!window.confirm("Send this order to Shiprocket?")) return;

    try {
      const res = await api.post(
        `/admin-dashboard/shiprocket/create/${orderId}`,
      );

      alert(`Shipment created!\nAWB: ${res.data.data?.awb_code || "-"}`);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Shiprocket failed");
    }
  };

  /* ================= LOCAL COURIER SAVE ================= */
  const saveLocalCourier = async () => {
    try {
      await api.post(
        `/admin-dashboard/orders/${selectedOrderId}/local-shipping`,
        localCourier,
      );

      alert("Local courier added");
      setLocalOpen(false);
      setLocalCourier({
        partner: "",
        awb: "",
        tracking_url: "",
        shipping_amount: "",
      });
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        String(o.id).includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        String(o.user?.phone || "").includes(q),
    );
  }, [orders, search]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  /* ================= STATUS BADGE ================= */
  const shipmentBadge = (status) => {
    if (!status)
      return <span className="text-xs text-gray-400">Not shipped</span>;
    const map = {
      pending: "bg-gray-200 text-gray-700",
      created: "bg-blue-100 text-blue-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${map[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <input
        placeholder="Search by order / name / phone"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="border px-3 py-2 rounded w-64"
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-left">ShipRocket Created Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginated.map((o, i) => (
                  <tr key={o.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-500">{(page - 1) * perPage + i + 1}</td>
                    <td className="p-3 font-medium">ORD-{o.id}</td>
                    <td className="p-3">{o.user?.name}</td>
                    <td className="p-3">{o.user?.phone}</td>
                    <td className="p-3 text-right font-semibold">₹ {o.total_amount}</td>
                    <td className="p-3 space-y-1">
                      {shipmentBadge(o.shipment_status)}
                      {shipmentBadge(o.shiprocket_order_id)}
                      {o.awb_code && <div className="text-xs">AWB: {o.awb_code}</div>}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => navigate(`/pos/orders/${o.id}`)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Rows per page:</span>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(+e.target.value); setPage(1); }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <span>
            {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="px-2 py-1 rounded text-sm border disabled:opacity-40 hover:bg-gray-100"
          >
            «
          </button>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded text-sm border disabled:opacity-40 hover:bg-gray-100"
          >
            Prev
          </button>

          {Array.from({ length: totalPages || 1 }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    page === p
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded text-sm border disabled:opacity-40 hover:bg-gray-100"
          >
            Next
          </button>
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(totalPages)}
            className="px-2 py-1 rounded text-sm border disabled:opacity-40 hover:bg-gray-100"
          >
            »
          </button>
        </div>
      </div>

      {/* LOCAL COURIER POPUP */}
      {localOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-lg">Local Courier</h3>

            {["partner", "awb", "tracking_url", "shipping_amount"].map((f) => (
              <input
                key={f}
                placeholder={f.replace("_", " ")}
                value={localCourier[f]}
                onChange={(e) =>
                  setLocalCourier({
                    ...localCourier,
                    [f]: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />
            ))}

            <div className="flex gap-3">
              <button
                onClick={saveLocalCourier}
                className="flex-1 bg-black text-white py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setLocalOpen(false)}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
