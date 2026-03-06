import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import api from "../../../api/axios";
import { EditgenerateVariants } from "./EditgenerateVariants";
import EditVariantSelect from "./EditVariantSelect";
import EditVariantTable from "./EditVariantTable";

const EditStepVariation = forwardRef(
  ({ productId, existingCombinations = [] }, ref) => {
    const [tableData, setTableData] = useState([]); // rows for table

    const [variations, setVariations] = useState([]);
    const [selected, setSelected] = useState({});
    const [rows, setRows] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [initialized, setInitialized] = useState(false);

    const [skipNextRegen, setSkipNextRegen] = useState(false);

    /* ================= PREFILL EXISTING ================= */

    useEffect(() => {
      if (!existingCombinations.length || !variations.length) return;

      const sel = {};
      const rowMap = {};

      console.log("Existing", existingCombinations);

      // Initialize selection map for all variations
      variations.forEach((v) => {
        sel[v.id] = [];
      });

      existingCombinations.forEach((combo) => {
        if (!Array.isArray(combo.combination_values)) return;

        // 🔥 IMPORTANT: numeric sort for key consistency
        const ids = combo.combination_values
          .map((cv) => Number(cv?.value?.id))
          .filter(Boolean)
          .sort((a, b) => a - b);

        if (!ids.length) return;

        const key = ids.join("_"); // e.g. "4" or "2_5"

        // Build selected values per variation
        combo.combination_values.forEach((cv) => {
          const variationId = cv.value.variation_id;

          // Initialize if not exists
          if (!sel[variationId]) {
            sel[variationId] = [];
          }

          sel[variationId].push({
            id: cv.value.id,
            value: cv.value.value,
          });
        });

        // Map existing row data by key
        rowMap[key] = {
          key,
          id: combo.id,
          label: combo.combination_values.map((v) => v.value.value).join(" / "),
          sku: combo.sku ?? "",
          purchase_price: combo.purchase_price ?? "",
          price: combo.extra_price ?? "",
          discount: combo.discount ?? "",
          qty: combo.quantity ?? "",
          low_qty: combo.low_quantity ?? "",
          images: combo.images ?? [],
          imagesTouched: false,
        };
      });

      // Remove duplicate selected values (safety)
      Object.keys(sel).forEach((k) => {
        sel[k] = Array.from(new Map(sel[k].map((v) => [v.id, v])).values());
      });

      // Set selected variations (this WILL trigger regenerate effect)
      setSelected(sel);

      // Generate variant combinations from selected
      const combos = EditgenerateVariants(sel);

      // Prefill rows using rowMap
      // setRows(
      //   combos.map((c) => ({
      //     key: c.key,
      //     label: c.label,
      //     ...(rowMap[c.key] || {}), // 🔥 safe spread
      //   })),
      // );

      setRows(
        combos.map((c) => ({
          key: c.key,
          label: c.label,
          ...(rowMap[c.key] || {}),
        })),
      );

      setLabels(combos.map((c) => c.label));

      // 🔥 Prevent overwrite by regenerate effect
      setSkipNextRegen(true);
      // setInitialized(true);
    }, [existingCombinations, variations]);

    /* ================= REGENERATE ON SELECT ================= */

    useEffect(() => {
      if (!variations.length) return;

      const groups = Object.values(selected).filter(
        (vals) => Array.isArray(vals) && vals.length,
      );

      // 🔥 DO NOT CLEAR ROWS ON EDIT LOAD
      if (!groups.length) {
        if (existingCombinations.length === 0) {
          setRows([]);
          setLabels([]);
        }
        return;
      }

      const combos = EditgenerateVariants(selected);

      setRows((prev) =>
        combos.map((c) => {
          const existing = prev.find((r) => r.key === c.key);

          return existing
            ? { ...existing, label: c.label }
            : {
                key: c.key,
                label: c.label,
                sku: "",
                purchase_price: "",
                price: "",
                discount: "",
                qty: "",
                low_qty: "",
                images: [],
                imagesTouched: false,
              };
        }),
      );

      setLabels(combos.map((c) => c.label));
    }, [selected, variations, existingCombinations]);

    /* ================= LOAD VARIATIONS ================= */
    useEffect(() => {
      (async () => {
        try {
          const res = await api.get("/admin-dashboard/get-variations");
          const raw = Array.isArray(res.data?.data) ? res.data.data : [];

          const normalized = raw.map((v) => ({
            id: v.id,
            name: v.name,
            type: v.type || "text",
            values: Array.isArray(v.values)
              ? v.values.map((val) => ({
                  id: val.id,
                  value: val.value,
                  color_code: val.color_code || null,
                }))
              : [],
          }));

          setVariations(normalized);

          const init = {};
          normalized.forEach((v) => (init[v.id] = []));
          setSelected(init);
        } catch (err) {
          console.error("Failed to load variations:", err);
        }
      })();
    }, []);
    /* ================= IMAGE HANDLERS ================= */
    const addImages = (rowIndex, files) => {
      setRows((prev) =>
        prev.map((row, i) =>
          i === rowIndex
            ? {
                ...row,
                images: [...(row.images || []), ...files],
                imagesTouched: true,
              }
            : row,
        ),
      );
    };

    const removeImage = (rowIndex, imgIndex) => {
      setRows((prev) =>
        prev.map((row, i) =>
          i === rowIndex
            ? {
                ...row,
                images: row.images.filter((_, j) => j !== imgIndex),
                imagesTouched: true,
              }
            : row,
        ),
      );
    };

    /* ================= SAVE ================= */
    useImperativeHandle(ref, () => ({
      async saveStep() {
        try {
          setLoading(true);

          const fd = new FormData();

          rows.forEach((row, index) => {
            fd.append(`variants[${index}][id]`, row.id || "");
            fd.append(`variants[${index}][sku]`, row.sku || "");
            fd.append(
              `variants[${index}][purchase_price]`,
              row.purchase_price || 0,
            );
            fd.append(`variants[${index}][extra_price]`, row.price || 0);
            fd.append(`variants[${index}][discount]`, row.discount || 0);
            fd.append(`variants[${index}][quantity]`, row.qty || 0);
            fd.append(`variants[${index}][low_quantity]`, row.low_qty || 0);

            row.key
              .split("_")
              .forEach((id) =>
                fd.append(`variants[${index}][variation_value_ids][]`, id),
              );

            if (row.imagesTouched) {
              row.images
                .filter((img) => !(img instanceof File) && img.id)
                .forEach((img) =>
                  fd.append(`variants[${index}][keep_image_ids][]`, img.id),
                );

              row.images
                .filter((img) => img instanceof File)
                .forEach((file) =>
                  fd.append(`variants[${index}][images][]`, file),
                );
            }
          });

          await api.post(
            `/admin-dashboard/product/update-variation/${productId}`,
            fd,
          );

          return true;
        } finally {
          setLoading(false);
        }
      },
    }));

    return (
      <div className="bg-white rounded-xl border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Product Variations</h3>

        {variations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading variations...</p>
          </div>
        ) : (
          <>
            {variations.map((v) => (
              <EditVariantSelect
                key={v.id}
                label={v.name}
                options={v.values || []}
                selected={selected[v.id] || []}
                onChange={(vals) =>
                  setSelected((p) => ({
                    ...p,
                    [v.id]: [...vals],
                  }))
                }
              />
            ))}
          </>
        )}

        {labels.length > 0 && (
          <EditVariantTable
            variants={labels}
            data={rows}
            setData={setRows}
            addImages={addImages}
            removeImage={removeImage}
          />
        )}

        {loading && <p>Saving variations…</p>}
      </div>
    );
  },
);

export default EditStepVariation;
