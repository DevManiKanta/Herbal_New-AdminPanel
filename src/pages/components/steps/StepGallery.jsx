import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import api from "../../../api/axios";

const StepGallery = forwardRef(({ productId }, ref) => {
  const inputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [videoUrls, setVideoUrls] = useState([""]);
  const [loading, setLoading] = useState(false);

  /* ================= IMAGE HANDLERS ================= */

  const handleFiles = (files) => {
    const list = Array.from(files);
    setImages((prev) => [...prev, ...list]);

    if (images.length === 0 && list.length > 0) {
      setMainIndex(0);
    }
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);

    if (index === mainIndex) setMainIndex(0);
    else if (index < mainIndex) setMainIndex((prev) => prev - 1);
  };

  /* ================= VIDEO HANDLERS ================= */

  const addVideoUrl = () => {
    setVideoUrls((prev) => [...prev, ""]);
  };

  const removeVideoUrl = (index) => {
    setVideoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (index, value) => {
    const updated = [...videoUrls];
    updated[index] = value;
    setVideoUrls(updated);
  };

  /* ================= EXPOSE SAVE ================= */

  // useImperativeHandless(ref, () => ({
  //   async saveStep() {
  //     if (!productId) {
  //       alert("Product not created yet");
  //       return false;
  //     }

  //     try {
  //       setLoading(true);

  //       const formData = new FormData();

  //       /* ✅ IMAGES */
  //       images.forEach((file) => {
  //         formData.append("images[]", file);
  //       });

  //       formData.append("main_index", mainIndex);

  //       /* ✅ VIDEO URLS */
  //       videoUrls
  //         .filter((v) => v.trim())
  //         .forEach((url) => {
  //           formData.append("video_urls[]", url);
  //         });

  //       /* 🔥 SINGLE API CALL */
  //       await api.post(
  //         `/admin-dashboard/product/${productId}/gallery`,
  //         formData,
  //         {
  //           headers: { "Content-Type": "multipart/form-data" },
  //         },
  //       );

  //       return true;
  //     } catch (error) {
  //       console.error(error);
  //       alert("Failed to save product gallery");
  //       return false;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  // }));

  useImperativeHandle(ref, () => ({
    async saveStep() {
      if (!productId) {
        alert("Product not created yet");
        return false;
      }

      try {
        setLoading(true);

        const formData = new FormData();

        // ✅ IMAGES
        if (images.length > 0) {
          images.forEach((file) => {
            formData.append("images[]", file);
          });

          formData.append("main_index", mainIndex);
        }

        // ✅ VIDEO URLS
        videoUrls
          .filter((v) => v.trim())
          .forEach((url) => {
            formData.append("video_urls[]", url);
          });

        const response = await api.post(
          `/admin-dashboard/product/${productId}/gallery`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        if (response.data?.success === false) {
          let errorMessage = "Failed to save gallery";
          if (response.data?.errors) {
            if (typeof response.data.errors === "string") {
              errorMessage = response.data.errors;
            } else if (typeof response.data.errors === "object") {
              errorMessage = Object.values(response.data.errors)
                .flat()
                .join(", ");
            }
          }
          alert(errorMessage);
          return false;
        }

        return true;
      } catch (error) {
        console.error("API Error:", error);

        let message = "Failed to save product gallery";

        if (error.response) {
          const errorData = error.response.data;
          if (errorData?.errors) {
            if (typeof errorData.errors === "string") {
              message = errorData.errors;
            } else if (typeof errorData.errors === "object") {
              message = Object.values(errorData.errors)
                .flat()
                .join(", ");
            }
          } else if (errorData?.message) {
            message = errorData.message;
          }
        } else if (error.request) {
          message = "No response from server";
        } else {
          message = error.message;
        }

        alert(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
  }));

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Product Gallery</h3>
        <p className="text-sm text-gray-500">
          Upload product images and add video links
        </p>
      </div>

      {/* IMAGE UPLOAD */}
      <div
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8
        flex flex-col items-center justify-center text-center
        cursor-pointer hover:border-indigo-500 transition"
      >
        <UploadIcon />
        <p className="mt-2 text-sm font-medium text-gray-700">
          Click to upload images
        </p>
        <p className="text-xs text-gray-400">
          JPG, PNG, WEBP • Multiple files allowed
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* IMAGE GRID */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Select main image</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setMainIndex(i)}
                className={`relative rounded-xl overflow-hidden border cursor-pointer
                ${
                  i === mainIndex
                    ? "ring-2 ring-indigo-500"
                    : "hover:ring-2 hover:ring-gray-300"
                }`}
              >
                {i === mainIndex && (
                  <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded">
                    Main
                  </span>
                )}

                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="h-32 w-full object-cover"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIDEO URLS */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Product Video URLs (optional)
        </label>

        {videoUrls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => handleVideoChange(index, e.target.value)}
              className="input flex-1"
              placeholder="https://youtube.com/watch?v=..."
            />

            {videoUrls.length > 1 && (
              <button
                type="button"
                onClick={() => removeVideoUrl(index)}
                className="px-3 rounded-lg bg-red-500 text-white"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addVideoUrl}
          className="text-sm text-indigo-600 hover:underline"
        >
          + Add another video
        </button>
      </div>

      {loading && <p className="text-sm text-indigo-600">Saving gallery...</p>}
    </div>
  );
});

export default StepGallery;

/* ================= ICON ================= */

function UploadIcon() {
  return (
    <svg
      className="w-10 h-10 text-gray-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
      <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
    </svg>
  );
}
