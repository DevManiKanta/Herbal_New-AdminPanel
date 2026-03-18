import { useEffect, useRef, useState } from "react";
import StepBasic from "./steps/StepBasic";
import StepGallery from "./steps/StepGallery";
import StepVariation from "./steps/StepVariation";
import StepMeta from "./steps/StepMeta";
import StepTax from "./steps/StepTax";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { celebrateSuccess } from "../../utils/celebrate";

const STEPS = ["Basic", "Gallery", "Variation", "SEO", "Tax"];

export default function AddProductDrawer({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const basicRef = useRef(null);
  const galleryRef = useRef(null);
  const variationRef = useRef(null);
  const metaRef = useRef(null);
  const taxRef = useRef(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setProductId(null);
      setError(null);
    }
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!open) return null;

  const handleNext = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (step === 1) {
        // Step 1 is handled by StepBasic component
        return;
      }

      if (step === 2 && galleryRef.current) {
        if (!(await galleryRef.current.saveStep())) return;
        toast.success("✅ Gallery saved successfully!", {
          position: "top-right",
          autoClose: 2000,
          style: {
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0",
          },
        });
      }
      if (step === 3 && variationRef.current) {
        if (!(await variationRef.current.saveStep())) return;
        toast.success("✅ Variations saved successfully!", {
          position: "top-right",
          autoClose: 2000,
          style: {
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0",
          },
        });
      }
      if (step === 4 && metaRef.current) {
        if (!(await metaRef.current.saveStep())) return;
        toast.success("✅ SEO saved successfully!", {
          position: "top-right",
          autoClose: 2000,
          style: {
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0",
          },
        });
      }
      if (step === 5 && taxRef.current) {
        if (!(await taxRef.current.saveStep())) return;

        await api.post(`/admin-dashboard/publish-product/${productId}`);

        celebrateSuccess();
        toast.success("🎉 Product published successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: {
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0",
          },
        });

        setTimeout(onClose, 1200);
        return;
      }

      setStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error:", error);
      
      let errorMessage = "An error occurred. Please try again.";
      if (error.response?.data?.errors) {
        if (typeof error.response.data.errors === "string") {
          errorMessage = error.response.data.errors;
        } else if (typeof error.response.data.errors === "object") {
          errorMessage = Object.values(error.response.data.errors)
            .flat()
            .join(", ");
        }
      }
      
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (loading) return;
    setStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* LEFT SIDEBAR */}
        <div className="w-full max-w-6xl h-[90vh] flex bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* SIDEBAR (20%) */}
          <div className="w-[20%] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex flex-col shadow-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Add Product</h2>
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
              onClick={handleClose}
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
                {/* ERROR ALERT */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in">
                    <span className="text-red-600 text-xl flex-shrink-0">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900">Error</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800 flex-shrink-0 text-lg"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* CONTENT */}
                <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-6">
                  {step === 1 && (
                    <StepBasic ref={basicRef} setProductId={setProductId} setStep={setStep} setError={setError} />
                  )}
                  {step === 2 && (
                    <StepGallery ref={galleryRef} productId={productId} />
                  )}
                  {step === 3 && (
                    <StepVariation ref={variationRef} productId={productId} />
                  )}
                  {step === 4 && <StepMeta ref={metaRef} productId={productId} />}
                  {step === 5 && <StepTax ref={taxRef} productId={productId} />}

                  {loading && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                      <p className="text-sm text-blue-700">
                        {step === 5 ? "Publishing..." : "Saving..."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-8 py-6 border-t border-indigo-100 bg-white/50 backdrop-blur-sm flex justify-between items-center gap-4">
              <button
                disabled={step === 1 || loading}
                onClick={handleBack}
                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                ← Back
              </button>

              <button
                onClick={handleNext}
                disabled={loading}
                className={`px-8 py-2 rounded-lg text-white font-semibold shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    step === 5
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110"
                      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:brightness-110"
                  }
                `}
              >
                {loading
                  ? step === 5
                    ? "Publishing..."
                    : "Saving..."
                  : step === 5
                    ? "Publish Product"
                    : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
