

import { useEffect, useRef, useState } from "react";

export default function ProductCard({ product, onClick }) {
  const images = product.image_url ? [{ image_url: product.image_url }] : [];

  const variants = product.variants || [];

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const startHover = () => {
    if (images.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 900);
  };

  const stopHover = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setIndex(0);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div
      onMouseEnter={startHover}
      onMouseLeave={stopHover}
      onClick={() => onClick(product)}
      className="bg-white rounded-2xl border cursor-pointer hover:shadow-lg transition overflow-hidden h-48 flex flex-col"
    >
      {/* IMAGE */}
      <div className="relative h-24 bg-gray-100 flex-shrink-0">
        {images.length > 0 ? (
          <img
            src={images[index]?.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-medium line-clamp-2">{product.name}</h4>

          <p className="text-sm font-semibold mt-1">
            ₹ {variants?.[0]?.price || 0}
          </p>
        </div>

        <p className="text-xs text-gray-500">
          {variants?.length || 0} variants
        </p>
      </div>
    </div>
  );
}
