import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import RichTextEditor from "../RichTextEditor";

export default function StepBasic({ setStep, setProductId, setError }) {
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

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin-dashboard/list-category-all");
        setCategories(res.data?.data || []);
      } catch {
        alert("Failed to load categories");
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // const mainCategories = categories.filter((c) => c.parent_id === null);

  const mainCategories = categories.filter(
    (c) => c.parent_id === null || c.parent_id === 0,
  );
  // const subCategories = categories.filter(
  //   (c) => c.parent_id === form.category_id,
  // );

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

  const handleSpecChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const addSpecRow = () =>
    setSpecifications([...specifications, { key: "", value: "" }]);

  const removeSpecRow = (index) =>
    setSpecifications(specifications.filter((_, i) => i !== index));

  const handleRichTextChange = (value) => {
    setDynamicData((prev) => ({
      ...prev,
      [activeTab]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category_id) {
      toast.error("Required fields missing");
      return;
    }

    const formattedSpecs = specifications
      .filter((s) => s.key && s.value)
      .reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

    try {
      setLoading(true);

      const res = await api.post("/admin-dashboard/create-product", {
        ...form,
        category_id: form.subcategory_id || form.category_id,
        specifications: formattedSpecs,
        extra_details: dynamicData,
      });

      setProductId(res.data?.product?.id);
      setStep(2);
    } catch (error) {
      console.error("API Error:", error.response?.data || error);
      
      const errorData = error.response?.data;
      let errorMessage = "Something went wrong";

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
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="py-12 text-center">Loading...</div>;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* ================= ROW 1 ================= */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Product Name
          </label>
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

      {/* ================= ROW 2 ================= */}
      <div className="border border-gray-200 rounded-xl bg-gray-50 p-5">
        {/* TABS */}
        <div className="flex gap-2 flex-wrap mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition
              ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 hover:bg-gray-100"
              }
            `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === "Product Specifications" ? (
          <div className="space-y-3">
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <input
                  placeholder="Field"
                  className="input w-1/2"
                  value={spec.key}
                  onChange={(e) =>
                    handleSpecChange(index, "key", e.target.value)
                  }
                />
                <input
                  placeholder="Value"
                  className="input w-1/2"
                  value={spec.value}
                  onChange={(e) =>
                    handleSpecChange(index, "value", e.target.value)
                  }
                />
                {specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecRow(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addSpecRow}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
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

      {/* SAVE BUTTON — NO EXTRA GAP */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r 
                   from-indigo-600 to-purple-600
                   text-white font-medium 
                   shadow-md hover:opacity-95 transition"
        >
          {loading ? "Saving..." : "Save & Continue →"}
        </button>
      </div>
    </div>
  );
}

/* ================= SEARCHABLE SELECT ================= */

function SearchableSelect({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = options.find((o) => o.id == value);

  return (
    <div className="relative" ref={ref}>
      <label className="text-sm font-medium">{label}</label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input mt-1 flex justify-between items-center w-full"
      >
        <span>{selected ? selected.name : placeholder}</span>
        <span>▾</span>
      </button>

      {open && (
        <div className="absolute z-40 w-full mt-1 border bg-white shadow-lg max-h-52 overflow-y-auto">
          {options.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50"
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
