

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

      <div className="fixed inset-0 z-[9999] flex">
        {/* ================= LEFT SIDEBAR 20% ================= */}
        <div className="w-[20%] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-8 flex flex-col shadow-2xl">
          <h2 className="text-2xl font-semibold mb-2">Edit Product dfdf</h2>
          <p className="text-sm text-white/80 mb-10">
            Step {step} of {STEPS.length}
          </p>

          <div className="space-y-4 flex-1">
            {STEPS.map((label, index) => {
              const tabStep = index + 1;
              const isActive = step === tabStep;
              const isCompleted = step > tabStep;

              return (
                <button
                  key={label}
                  disabled={isCompleted}
                  onClick={() => !isCompleted && setStep(tabStep)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300
                    ${
                      isActive
                        ? "bg-white text-indigo-700 shadow-lg scale-105"
                        : isCompleted
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold
                        ${
                          isActive ? "bg-indigo-600 text-white" : "bg-white/20"
                        }`}
                    >
                      {tabStep}
                    </div>
                    <span>{label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="text-sm text-white/80 hover:text-white"
          >
            ✕ Close
          </button>
        </div>

        {/* ================= RIGHT SIDE 80% ================= */}
        <div className="w-[80%] overflow-y-auto px-8 py-8 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
          <div className="relative bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-indigo-100 p-8 w-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-t-2xl" />

            {loading ? (
              <div className="text-center py-20 text-gray-500">
                Loading product...
              </div>
            ) : (
              <>
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

                {/* FOOTER */}
                <div className="mt-10 pt-6 flex justify-between items-center border-t border-indigo-100">
                  <button
                    disabled={step === 1}
                    onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                    className="px-6 py-2 rounded-lg text-gray-600 hover:bg-indigo-50"
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
                      className="px-8 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
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
                      className="px-8 py-2 rounded-lg text-white bg-green-600"
                    >
                      Update Product
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
