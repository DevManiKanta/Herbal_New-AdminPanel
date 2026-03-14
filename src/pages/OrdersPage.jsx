// import { useEffect, useState } from "react";
// import api from "../api/axios";

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [stats, setStats] = useState({});
//   const [loading, setLoading] = useState(true);

//   const [status, setStatus] = useState("all");
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);

//   const perPage = 10;

//   /* ================= LOAD DATA ================= */

//   const loadOrders = async () => {
//     setLoading(true);
//     const res = await api.get("/cart/online-orders", {
//       params: { status, search, page, perPage },
//     });
//     setOrders(res.data.data || []);
//     setLoading(false);
//   };

//   const loadStats = async () => {
//     const res = await api.get("/cart/online-orders/stats");
//     setStats(res.data.data);
//   };

//   useEffect(() => {
//     loadOrders();
//     loadStats();
//   }, [status, search, page]);

//   return (
//     <div className="space-y-6">
//       {/* ================= HEADER ================= */}
//       <div className="flex justify-between">
//         <h1 className="text-2xl font-semibold">Orders</h1>
//       </div>

//       {/* ================= STATS ================= */}
//       <div className="grid grid-cols-4 gap-4">
//         <Stat title="Total orders" value={stats.totalOrders} />
//         <Stat title="Total revenue" value={`₹${stats.totalRevenue || 0}`} />
//         <Stat title="Pending orders" value={stats.pendingOrders} />
//         <Stat title="Completed orders" value={stats.completedOrders} />
//       </div>

//       {/* ================= TABS ================= */}
//       <div className="flex gap-3 border-b pb-2">
//         {["all", "placed", "completed"].map((s) => (
//           <button
//             key={s}
//             onClick={() => {
//               setStatus(s);
//               setPage(1);
//             }}
//             className={`px-3 py-1 rounded ${
//               status === s ? "bg-indigo-100 text-indigo-700" : "text-gray-500"
//             }`}
//           >
//             {s.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {/* ================= SEARCH ================= */}
//       <input
//         type="text"
//         placeholder="Search order..."
//         className="border px-3 py-2 rounded"
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {/* ================= TABLE ================= */}
//       <div className="bg-white rounded-xl overflow-x-auto">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-4 py-3">Order ID</th>
//               <th>Items</th>
//               <th>Total</th>
//               <th>Payment</th>
//               <th>Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders.map((o) => (
//               <tr key={o.id} className="border-t">
//                 <td className="px-4 py-3">#{o.id}</td>
//                 <td>{o.items.length}</td>
//                 <td>₹{o.total_amount}</td>
//                 <td>{o.payment_status}</td>
//                 <td>{o.order_status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// const Stat = ({ title, value }) => (
//   <div className="bg-white p-4 rounded-xl border">
//     <p className="text-xs text-gray-500">{title}</p>
//     <p className="text-xl font-semibold">{value}</p>
//   </div>
// );

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import api from "../api/axios";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({});

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [pagination, setPagination] = useState({
    totalPages: 1,
  });

  /* ================= LOAD ORDERS ================= */
  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get("/cart/online-orders", {
        params: {
          status: activeTab,
          search,
          page,
          perPage,
        },
      });

      setOrders(res.data.data || []);
      setPagination(res.data.pagination || { totalPages: 1 });
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD STATS ================= */
  const loadStats = async () => {
    try {
      const res = await api.get("/cart/online-orders/stats");
      setStats(res.data.data || {});
    } catch (err) {

    }
  };

  const loadStatusCounts = async () => {
    try {
      const res = await api.get("/cart/online-orders/status-counts");
      setStatusCounts(res.data.data || {});
    } catch (err) {

    }
  };
  const changeOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/cart/online-orders/${orderId}/status`, {
        order_status: status,
      });

      // reload orders after update
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status");
    }
  };

  useEffect(() => {
    loadOrders();
    loadStats();
    loadStatusCounts();
  }, [activeTab, search, page]);

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Orders</h1>

          <button className="flex items-center gap-2 border px-3 py-1.5 rounded-lg text-sm text-gray-600">
            <span>Today</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3">
          <button className="border px-4 py-2 rounded-lg text-sm">
            Order report
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Create a manual order
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-4 gap-4">
        <Stat title="Total orders" value={stats.totalOrders || 0} />
        <Stat title="Total revenue" value={`₹${stats.totalRevenue || 0}`} />
        <Stat title="Total pending orders" value={stats.pendingOrders || 0} />
        <Stat
          title="Total completed orders"
          value={stats.completedOrders || 0}
        />
      </div>

      {/* ================= TABS ================= */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex gap-6 border-b text-sm">
          {[
            ["all", "All"],
            ["bill_sent", "Bill Sent"],
            ["ready", "Ready To Pick"],
            ["in_transit", "In Transit"],
            ["completed", "Completed"],
            ["others", "Others"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setPage(1);
              }}
              className={`relative pb-2
        ${
          activeTab === key
            ? "text-blue-600 font-medium"
            : "text-gray-500 hover:text-gray-700"
        }`}
            >
              {label}
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full
          ${
            activeTab === key
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
              >
                {statusCounts[key] ?? 0}
              </span>

              {/* underline */}
              {activeTab === key && (
                <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search order..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <button className="border p-2 rounded-lg">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" />
              </th>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Order type</th>
              <th className="px-4 py-3 text-left">Order status</th>
              <th className="px-4 py-3 text-center">Items</th>
              <th className="px-4 py-3 text-left">Payment mode</th>
              <th className="px-4 py-3 text-left">Payment status</th>
              <th className="px-4 py-3 text-left">view</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="10" className="text-center py-6 text-gray-400">
                  Loading orders...
                </td>
              </tr>
            )}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center py-6 text-gray-400">
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-3 font-medium">#{o.id}</td>
                <td className="px-4 py-3">{o.user?.phone || "-"}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  ₹{o.total_amount}
                </td>
                <td className="px-4 py-3">Self Billed</td>
                <td className="px-4 py-3">
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">
                    {o.order_status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {o.items?.length || 0}
                </td>
                <td className="px-4 py-3">{o.payment_method}</td>
                <td className="px-4 py-3 text-gray-500">{o.payment_status}</td>
                {/* <td className="px-4 py-3 text-gray-500">{o.payment_status}</td> */}
                <td className="px-4 py-3 text-gray-500">
                  <button
                    onClick={() => navigate(`/orders/${o.id}`)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View
                  </button>
                </td>

                <td className="px-4 py-3">
                  <select
                    value={o.order_status}
                    onChange={(e) => changeOrderStatus(o.id, e.target.value)}
                    className="border rounded-md px-2 py-1 text-xs
      bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="placed">Placed</option>
                    <option value="bill_sent">Bill Sent</option>
                    <option value="ready">Ready To Pick</option>
                    <option value="in_transit">In Transit</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-end gap-2 text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Prev
        </button>
        <span>
          Page {page} / {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

const Stat = ({ title, value }) => (
  <div className="bg-white border rounded-xl p-4">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-lg font-semibold mt-1">{value}</p>
  </div>
);
