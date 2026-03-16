

"use client";

import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

import EditStepBasic from "./steps/EditStepBasic";
import EditStepGallery from "./steps/EditStepGallery";
import EditStepVariation from "./steps/EditStepVariation";
import EditStepMeta from "./steps/EditStepMeta";
import EditStepTax from "./steps/EditStepTax";

const STEPS = ["Basic", "Gallery", "Variation", "SEO", "Tax"];

export default function EditProductDrawer({ open, onClose, productId }) {
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const galleryRef = useRef(null);
  const variationRef = useRef(null);
  const metaRef = useRef(null);
  const taxRef = useRef(null);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    if (!open || !productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/admin-dashboard/product/fetch-products-by-id/${productId}`,
        );

        setProduct(res.data.data);
      } catch (err) {
        console.error("Failed to fetch product", err);
        toast.error("Failed to load product", {
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
        setLoading(false);
      }
    };

    fetchProduct();
  }, [open, productId]);

  /* ================= RESET ON CLOSE ================= */

  useEffect(() => {
    if (!open) {
      setStep(1);
      setProduct(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* MAIN MODAL */}
        <div className="w-full max-w-6xl h-[90vh] flex bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* SIDEBAR (20%) */}
          <div className="w-[20%] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex flex-col shadow-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Edit Product</h2>
              <p className="text-sm text-white/70 mt-1">
                Step {step} of {STEPS.length}
              </p>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {STEPS.map((label, index) => {
                const tabStep = index + 1;
                const isActive = step === tabStep;
                const isCompleted = step > tabStep;

                return (
                  <button
                    key={label}
                    disabled={isCompleted}
                    onClick={() => !isCompleted && setStep(tabStep)}
                    className={`group w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3
                      ${
                        isActive
                          ? "bg-white text-indigo-700 shadow-lg"
                          : isCompleted
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-white/10"
                      }
                    `}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${
                          isActive ? "bg-indigo-600 text-white" : "bg-white/20"
                        }`}
                    >
                      {isCompleted ? "✓" : tabStep}
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition duration-200 text-sm font-medium"
            >
              ✕ Close
            </button>
          </div>

          {/* CONTENT AREA (80%) */}
          <div className="w-[80%] flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* HEADER */}
            <div className="px-8 py-6 border-b border-indigo-100 bg-white/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-gray-800">
                {STEPS[step - 1]}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Complete this step to continue
              </p>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="max-w-4xl">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Loading product...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* CONTENT */}
                    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-6">
                      {step === 1 && (
                        <EditStepBasic product={product} setStep={setStep} />
                      )}

                      {step === 2 && (
                        <EditStepGallery
                          ref={galleryRef}
                          productId={productId}
                          existingImages={product?.gallery || []}
                          existingVideo={product?.video}
                        />
                      )}

                      {step === 3 && (
                        <EditStepVariation
                          ref={variationRef}
                          productId={productId}
                          existingCombinations={product?.variantCombinations || []}
                        />
                      )}

                      {step === 4 && (
                        <EditStepMeta
                          ref={metaRef}
                          productId={productId}
                          meta={product?.meta || {}}
                        />
                      )}

                      {step === 5 && (
                        <EditStepTax
                          ref={taxRef}
                          productId={product?.id}
                          productStatus={product?.status}
                          data={product?.product_tax}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* FOOTER */}
            {!loading && (
              <div className="px-8 py-6 border-t border-indigo-100 bg-white/50 backdrop-blur-sm flex justify-between items-center gap-4">
                <button
                  disabled={step === 1 || loading}
                  onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                  className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
                >
                  ← Back
                </button>

                {step < 5 ? (
                  <button
                    onClick={async () => {
                      if (step === 2) {
                        if (!(await galleryRef.current?.saveStep())) return;
                      }

                      if (step === 3) {
                        if (!(await variationRef.current?.saveStep())) return;
                      }

                      if (step === 4) {
                        if (!(await metaRef.current?.saveStep())) return;
                      }

                      setStep((prev) => prev + 1);
                    }}
                    disabled={loading}
                    className="px-8 py-2 rounded-lg text-white font-semibold shadow-md transition-all duration-300 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      if (!(await taxRef.current?.saveStep())) return;
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
                      setTimeout(onClose, 1000);
                    }}
                    disabled={loading}
                    className="px-8 py-2 rounded-lg text-white font-semibold shadow-md transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Product
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
