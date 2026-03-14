import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
export default function CustomerManagement() {
  const navigate = useNavigate(); //
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  /* ================= FETCH CUSTOMERS ================= */
  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

  const fetchCustomers = async (pageNo = 1) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin-dashboard/user-order-details?page=${pageNo}`,
      );
      setCustomers(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  /* ================= BULK UPLOAD ================= */
  const handleBulkUpload = async () => {
    if (!bulkInput.trim()) return alert("Enter bulk data");

    const rows = bulkInput.split("\n");

    const customers = rows.map((row) => {
      const [name, phone] = row.split(",");
      return {
        name: name?.trim(),
        phone: phone?.trim(),
      };
    });

    try {
      await api.post("/admin-dashboard/customers/bulk-store", {
        customers,
      });

      alert("Bulk customers added");
      setBulkInput("");
      fetchCustomers(page);
    } catch (err) {
      alert(err.response?.data?.message || "Bulk error");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Customer Management</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Customer
        </button>
      </div>

      {/* ================= BULK SECTION ================= */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Bulk Upload</h3>

        <textarea
          placeholder="Name,Phone
John Doe,9876543210
Jane Smith,9123456789"
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          className="w-full border rounded-lg p-3 h-32 text-sm"
        />

        {/* <button
          onClick={handleBulkUpload}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Upload Bulk Customers
        </button> */}
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading customers...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Total Orders</th>
                <th className="px-4 py-3 text-left">Total Amount</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c, i) => (
                <tr
                  key={c.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/customers/${c.id}/orders`)}
                >
                  <td className="px-4 py-3">
                    {(meta.current_page - 1) * meta.per_page + i + 1}
                  </td>

                  <td className="px-4 py-3 font-medium">{c.name}</td>

                  <td className="px-4 py-3">{c.phone}</td>

                  <td className="px-4 py-3">
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs font-semibold">
                      {c.sales_count}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    ₹ {c.sales_sum_grand_total ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Page {meta.current_page} of {meta.last_page}
        </p>

        <div className="space-x-2">
          <button
            disabled={meta.current_page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={meta.current_page === meta.last_page}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* ================= ADD CUSTOMER MODAL ================= */}
      <AddCustomerModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => fetchCustomers(page)}
      />
    </div>
  );
}

/* ================= ADD CUSTOMER MODAL ================= */

function AddCustomerModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async () => {
    if (!name || !phone) {
      alert("Name & Phone required");
      return;
    }

    try {
      await api.post("/admin-dashboard/customers/store", {
        name,
        phone,
      });

      alert("Customer added successfully");

      setName("");
      setPhone("");

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating customer");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-96 space-y-4 shadow-xl">
        <h3 className="text-lg font-semibold">Add Customer</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Customer Name"
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <input
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="Phone Number"
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
