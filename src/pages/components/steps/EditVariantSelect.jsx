

import { useState } from "react";

export default function EditVariantSelect({
  label,
  options = [],
  selected = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const isSelected = (opt) => selected.some((s) => s.id === opt.id);

  const toggle = (opt) => {

    onChange(
      isSelected(opt)
        ? selected.filter((s) => s.id !== opt.id)
        : [...selected, opt],
    );
  };

  return (
    <div className="border rounded-xl p-4">
      <label className="text-sm font-medium">{label}</label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 w-full border rounded-lg px-4 py-3 text-left flex justify-between items-center"
      >
        {selected.length ? `${selected.length} selected` : `Select ${label}`}
        <span>▾</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isSelected(opt)}
                onChange={() => toggle(opt)}
              />
              {opt.value}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
