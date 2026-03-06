import { useEffect, useState } from "react";
import CategoryPills from "./components/CategoryPills";
import ProductCard from "./components/ProductCard";
import CartPanel from "./CartPanel";
import VariationModal from "./components/VariationModal";
import api from "../api/axios";

export default function POS() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [category, setCategory] = useState("all");

  const [cart, setCart] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = (products || []).slice(startIndex, startIndex + itemsPerPage);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    api
      .get("/admin-dashboard/list-category-all")
      .then((r) => setCategories(r.data.data))
      .catch((err) => console.error("Category fetch error:", err));
  }, []);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when category changes
    api
      .get("/admin-dashboard/pos-products", {
        params: { category }, // removed brand
      })
      .then((r) => setProducts(r.data.data))
      .catch((err) => console.error("Product fetch error:", err));
  }, [category]);

  /* ================= OPEN VARIATION MODAL ================= */
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const payload = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          variant_combination_id: item.variation_id,
          quantity: item.qty,
        })),
        payment_method: "cash",
        paid_amount: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        customer_name: "Walk-in Customer",
      };

      const res = await api.post("/admin-dashboard/create-order", payload);

      alert("Order placed successfully ✅");

      // Clear cart
      setCart([]);

      // Refresh products (stock updated)
      const refresh = await api.get("/admin-dashboard/pos-products", {
        params: { category },
      });

      setProducts(refresh.data.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Order failed");
    }
  };

  /* ================= ADD VARIANT TO CART ================= */
  const handleAddVariant = (variant) => {
    if (!selectedProduct) return;

    if (variant.stock <= 0) {
      alert("Out of stock");
      return;
    }

    setCart((prev) => {
      const index = prev.findIndex(
        (i) =>
          i.product_id === selectedProduct.id && i.variation_id === variant.id,
      );

      // Already in cart → increase qty
      if (index !== -1) {
        if (prev[index].qty >= variant.stock) {
          alert("Stock limit reached");
          return prev;
        }

        const updated = [...prev];
        updated[index].qty += 1;
        return updated;
      }

      // Add new item
      return [
        ...prev,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          variation_id: variant.id,
          variation_name: variant.name,
          price: variant.price,
          stock: variant.stock,
          qty: 1,
        },
      ];
    });

    setOpenModal(false);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* CATEGORY FILTER */}
        <CategoryPills
          items={categories}
          active={category}
          onChange={setCategory}
        />

        {/* PRODUCTS GRID */}
        <div className="flex-1 grid grid-cols-6 gap-1 overflow-y-auto">
          {paginatedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => handleProductClick(p)}
            />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              ◀ Prev
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 rounded-lg border transition ${
                    currentPage === i + 1
                      ? "bg-black text-white border-black"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              Next ▶
            </button>
          </div>
        )}
      </div>

      {/* CART PANEL */}
      <CartPanel cart={cart} setCart={setCart} onCheckout={handleCheckout} />

      {/* VARIATION MODAL */}
      <VariationModal
        open={openModal}
        product={selectedProduct}
        onClose={() => setOpenModal(false)}
        onConfirm={handleAddVariant}
      />
    </div>
  );
}
