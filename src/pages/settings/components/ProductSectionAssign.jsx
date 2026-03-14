import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function ProductSectionAssign({ product, onSaved }) {
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) return;



    const fetchSections = async () => {
      const res = await api.get("/admin-dashboard/sections");
      setSections(res.data.data || []);
    };

    fetchSections();

    // 🔥 AUTO SET SELECTED FROM PASSED PRODUCT
    const assigned = product.sections?.map((s) => s.id) || [];
    setSelected(assigned);
  }, [product]);

  const toggleSection = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await api.post(`/admin-dashboard/products/${product.id}/sections`, {
        sections: selected,
      });

      alert("Sections updated successfully");
      onSaved();
    } catch (error) {

      alert(
        error.response?.data?.message ||
          error.response?.data?.errors ||
          "Failed to update sections",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.id}
          onClick={() => toggleSection(section.id)}
          className={`border rounded-lg p-4 cursor-pointer transition
            ${
              selected.includes(section.id)
                ? "bg-indigo-50 border-indigo-600"
                : "hover:border-indigo-300"
            }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{section.name}</span>
            <input
              type="checkbox"
              //   checked={selected.includes(section.id)}
              checked={selected.includes(section.id)}
              onChange={() => toggleSection(section.id)}
              //   readOnly
            />
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
      >
        {loading ? "Saving..." : "Save Sections"}
      </button>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import api from "../../../api/axios";

// export default function ProductSectionAssign({ product, onSaved }) {
//   const [sections, setSections] = useState([]);
//   const [selected, setSelected] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [allSections, setAllSections] = useState([]);

//   /* ================= LOAD DATA ================= */
//   //   useEffect(() => {
//   //     if (!product) return;

//   //     const fetchSections = async () => {
//   //       const res = await api.get("/admin-dashboard/sections");
//   //       setSections(res.data.data || []);
//   //     };

//   //     fetchSections();

//   //     // 🔥 Set already assigned sections
//   //     const assigned = product.sections?.map((s) => Number(s.id)) || [];

//   //     setSelected(assigned);
//   //   }, [product]);

//   useEffect(() => {
//     const fetchSections = async () => {
//       try {
//         const res = await api.get("/admin-dashboard/sections");
//         setAllSections(res.data.data || []);
//       } catch (err) {
//         console.error("Failed to load sections");
//       }
//     };

//     fetchSections();
//   }, []);
//   /* ================= TOGGLE ================= */
//   const toggleSection = (id) => {
//     if (selected.includes(id)) {
//       // remove
//       setSelected(selected.filter((item) => item !== id));
//     } else {
//       // add
//       setSelected([...selected, id]);
//     }
//   };

//   /* ================= SAVE ================= */
//   const handleSave = async () => {
//     try {
//       setLoading(true);

//       await api.post(
//         `/admin-dashboard/products/${product.id}/assign-sections`,
//         {
//           sections: selected,
//         },
//       );

//       onSaved();
//     } catch (error) {
//       alert("Failed to update sections");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!product) return null;

//   return (
//     <div className="space-y-4">
//       {sections.map((section) => (
//         <label
//           key={section.id}
//           className={`flex justify-between items-center border rounded-lg p-4 cursor-pointer transition
//             ${
//               selected.includes(section.id)
//                 ? "bg-indigo-50 border-indigo-600"
//                 : "hover:border-indigo-300"
//             }`}
//         >
//           <span className="font-medium">{section.name}</span>

//           <input
//             type="checkbox"
//             checked={selected.includes(section.id)}
//             onChange={() => toggleSection(section.id)}
//             className="w-4 h-4"
//           />
//         </label>
//       ))}

//       <button
//         onClick={handleSave}
//         disabled={loading}
//         className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
//       >
//         {loading ? "Saving..." : "Save Sections"}
//       </button>
//     </div>
//   );
// }
