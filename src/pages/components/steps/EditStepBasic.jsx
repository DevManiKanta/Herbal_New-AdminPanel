
import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import RichTextEditor from "../RichTextEditor";
import toast from "react-hot-toast";

export default function EditStepBasic({ setStep, product }) {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    subcategory_id: "",
  });

  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);

  const tabs = [
    "Description",
    "Product Specifications",
    "Return & Exchange",
    "Shipping & Delivery",
    "Manufactured By",
    "Customer Care",
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [dynamicData, setDynamicData] = useState({});

  /* ================= PREFILL ================= */

  useEffect(() => {
    if (!product) return;

    const isSub = product.category?.parent_id;

    setForm({
      name: product.name ?? "",
      category_id: isSub
        ? String(product.category.parent_id)
        : String(product.category_id ?? ""),
      subcategory_id: isSub ? String(product.category_id) : "",
    });

    setSpecifications(
      product.specifications
        ? Object.entries(product.specifications).map(([k, v]) => ({
            key: k,
            value: v,
          }))
        : [{ key: "", value: "" }],
    );

    setDynamicData(product.extra_details || {});
  }, [product]);

  /* ================= FETCH CATEGORIES ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin-dashboard/list-category-all");
        setCategories(res.data?.data || []);
      } catch {
        toast.error("Failed to load categories", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#ef4444",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
            zIndex: 99999,
          },
        });
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const mainCategories = categories.filter((c) => c.parent_id === null);
  const subCategories = categories.filter(
    (c) => String(c.parent_id) === String(form.category_id),
  );

  /* ================= HANDLERS ================= */

  const handleChange = (key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "category_id") updated.subcategory_id = "";
      return updated;
    });
  };

  const handleSpecChange = (i, field, value) => {
    const updated = [...specifications];
    updated[i][field] = value;
    setSpecifications(updated);
  };

  const addSpec = () =>
    setSpecifications([...specifications, { key: "", value: "" }]);

  const removeSpec = (i) =>
    setSpecifications(specifications.filter((_, idx) => idx !== i));

  const handleRichTextChange = (val) => {
    setDynamicData((prev) => ({
      ...prev,
      [activeTab]: val,
    }));
  };

  /* ================= UPDATE ================= */

  const handleSubmit = async () => {
    if (!form.name || !form.category_id) {
      toast.error("Required fields missing", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 99999,
        },
      });
      return;
    }

    const formattedSpecs = specifications
      .filter((s) => s.key && s.value)
      .reduce((acc, cur) => {
        acc[cur.key] = cur.value;
        return acc;
      }, {});

    try {
      setLoading(true);

      const res = await api.post(`/admin-dashboard/update-product/${product.id}`, {
        name: form.name,
        category_id: form.subcategory_id || form.category_id,
        specifications: formattedSpecs,
        extra_details: dynamicData,
      });

      toast.success("Product updated successfully!", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#10b981",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 99999,
        },
        icon: "✓",
      });

      setStep(2);
    } catch (error) {
      
      const errorData = error.response?.data;
      let errorMessage = "Failed to update product";

      // Handle different error response formats
      if (errorData?.errors) {
        if (typeof errorData.errors === "string") {
          errorMessage = errorData.errors;
        } else if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors
            .map((err) => err.message || err)
            .join(", ");
        } else if (typeof errorData.errors === "object") {
          errorMessage = Object.entries(errorData.errors)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
        }
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === "string") {
        // Handle plain string error responses
        errorMessage = errorData;
      } else if (error.response?.status === 500) {
        // For 500 errors, try to extract meaningful message
        if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.exception) {
          // Extract from Laravel exception message
          const match = errorData.exception?.match(/Duplicate entry '([^']+)'/);
          if (match) {
            errorMessage = `Duplicate entry: "${match[1]}" already exists`;
          } else {
            errorMessage = "Database error: This product name or slug already exists";
          }
        }
      }

      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 99999,
        },
        icon: "⚠️",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="py-12 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
      {/* ROW 1 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Product Name</label>
          <input
            className="input mt-1"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <SearchableSelect
          label="Category"
          options={mainCategories}
          value={form.category_id}
          onChange={(id) => handleChange("category_id", id)}
          placeholder="Select category"
        />

        {form.category_id && subCategories.length > 0 ? (
          <SearchableSelect
            label="Sub Category"
            options={subCategories}
            value={form.subcategory_id}
            onChange={(id) => handleChange("subcategory_id", id)}
            placeholder="Select sub category"
          />
        ) : (
          <div />
        )}
      </div>

      {/* ROW 2 - DYNAMIC */}
      <div className="border rounded-lg p-4">
        {/* TABS */}
        <div className="flex gap-2 flex-wrap mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs rounded-md transition
              ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {activeTab === "Product Specifications" ? (
          <div className="space-y-3">
            {specifications.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Field"
                  className="input w-1/2"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(i, "key", e.target.value)}
                />
                <input
                  placeholder="Value"
                  className="input w-1/2"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(i, "value", e.target.value)}
                />
                {specifications.length > 1 && (
                  <button
                    onClick={() => removeSpec(i)}
                    className="text-red-500 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button onClick={addSpec} className="text-indigo-600 text-sm">
              + Add Field
            </button>
          </div>
        ) : (
          <RichTextEditor
            value={dynamicData[activeTab] || ""}
            onChange={handleRichTextChange}
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
      >
        {loading ? "Updating..." : "Update & Continue →"}
      </button>
    </div>
  );
}

function SearchableSelect({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = options.find((o) => String(o.id) === String(value));

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={ref}>
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input mt-1 flex justify-between items-center w-full"
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.name : placeholder}
        </span>
        <span>▾</span>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border bg-white shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              className="input"
              placeholder={`Search ${label}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-52 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50"
                >
                  {item.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
