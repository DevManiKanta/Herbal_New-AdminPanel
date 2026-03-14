// import {
//   useRef,
//   useState,
//   useEffect,
//   forwardRef,
//   useImperativeHandle,
// } from "react";
// import api from "../../../api/axios";

// const EditStepGallery = forwardRef(
//   ({ productId, existingImages = [], existingVideo = [] }, ref) => {
//     const inputRef = useRef(null);

//     /* ================= STATE ================= */

//     const [savedImages, setSavedImages] = useState([]);
//     const [newImages, setNewImages] = useState([]);
//     const [mainImageId, setMainImageId] = useState(null);

//     const [videoUrls, setVideoUrls] = useState([]);
//     const [loading, setLoading] = useState(false);

//     /* ================= LOAD EXISTING IMAGES ================= */

//     useEffect(() => {
//       if (!existingImages?.length) return;

//       const mapped = existingImages.map((img) => ({
//         id: img.id,
//         url: img.url,
//         is_primary: img.is_primary,
//       }));

//       setSavedImages(mapped);

//       const primary = mapped.find((i) => i.is_primary);
//       if (primary) setMainImageId(primary.id);
//     }, [existingImages]);

//     /* ================= LOAD EXISTING VIDEOS ================= */

//     useEffect(() => {
//       if (Array.isArray(existingVideo)) {
//         setVideoUrls(existingVideo.map((v) => v.video_url));
//       }
//     }, [existingVideo]);

//     /* ================= IMAGE HANDLERS ================= */

//     const handleFiles = (files) => {
//       setNewImages((prev) => [...prev, ...Array.from(files)]);
//     };

//     const removeSavedImage = async (id) => {
//       try {
//         await api.delete(`/admin-dashboard/product/image/${id}`);
//         setSavedImages((prev) => prev.filter((i) => i.id !== id));
//         if (mainImageId === id) setMainImageId(null);
//       } catch {
//         alert("Failed to delete image");
//       }
//     };

//     const removeNewImage = (index) => {
//       setNewImages((prev) => prev.filter((_, i) => i !== index));
//     };

//     /* ================= VIDEO HANDLERS ================= */

//     const addVideoUrl = () => {
//       setVideoUrls((prev) => [...prev, ""]);
//     };

//     const removeVideoUrl = (index) => {
//       setVideoUrls((prev) => prev.filter((_, i) => i !== index));
//     };

//     const updateVideoUrl = (index, value) => {
//       const copy = [...videoUrls];
//       copy[index] = value;
//       setVideoUrls(copy);
//     };

//     /* ================= SAVE STEP ================= */

//     useImperativeHandle(ref, () => ({
//       async saveStep() {
//         if (!productId) {
//           alert("Product ID missing");
//           return false;
//         }

//         try {
//           setLoading(true);

//           const formData = new FormData();

//           /* NEW IMAGES */
//           newImages.forEach((file) => {
//             formData.append("images[]", file);
//           });

//           /* MAIN IMAGE */
//           if (mainImageId) {
//             await api.post(
//               `/admin-dashboard/product/${productId}/set-main-image`,
//               {
//                 image_id: mainImageId,
//               },
//             );
//           }

//           /* VIDEOS */
//           videoUrls
//             .filter((v) => v.trim())
//             .forEach((url) => {
//               formData.append("video_urls[]", url);
//             });

//           if (newImages.length || videoUrls.length) {
//             await api.post(
//               `/admin-dashboard/product/${productId}/gallery`,
//               formData,
//               { headers: { "Content-Type": "multipart/form-data" } },
//             );
//           }

//           return true;
//         } catch (err) {
//           alert("Failed to save gallery");
//           return false;
//         } finally {
//           setLoading(false);
//         }
//       },
//     }));

//     /* ================= UI ================= */

//     return (
//       <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
//         {/* HEADER */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-800">
//             Product Gallery
//           </h3>
//           <p className="text-sm text-gray-500">Manage images and video URLs</p>
//         </div>

//         {/* UPLOAD */}
//         <div
//           onClick={() => inputRef.current.click()}
//           className="border-2 border-dashed border-gray-300 rounded-xl p-8
//           flex flex-col items-center justify-center text-center
//           cursor-pointer hover:border-indigo-500 transition"
//         >
//           <UploadIcon />
//           <p className="mt-2 text-sm font-medium text-gray-700">
//             Click to upload images
//           </p>
//           <p className="text-xs text-gray-400">
//             JPG, PNG, WEBP • Multiple files allowed
//           </p>

//           <input
//             ref={inputRef}
//             type="file"
//             multiple
//             accept="image/*"
//             hidden
//             onChange={(e) => handleFiles(e.target.files)}
//           />
//         </div>

//         {/* EXISTING IMAGES */}
//         {savedImages.length > 0 && (
//           <ImageGrid
//             title="Existing Images"
//             images={savedImages}
//             isSaved
//             mainImageId={mainImageId}
//             onSelect={setMainImageId}
//             onRemove={removeSavedImage}
//           />
//         )}

//         {/* NEW IMAGES */}
//         {newImages.length > 0 && (
//           <ImageGrid
//             title="New Images"
//             images={newImages}
//             onRemove={removeNewImage}
//           />
//         )}

//         {/* VIDEO URLS */}
//         <div className="space-y-2">
//           <label className="text-sm font-medium text-gray-700">
//             Product Video URLs
//           </label>

//           {videoUrls.map((url, index) => (
//             <div key={index} className="flex gap-2">
//               <input
//                 type="url"
//                 value={url}
//                 onChange={(e) => updateVideoUrl(index, e.target.value)}
//                 className="input flex-1"
//                 placeholder="https://youtube.com/watch?v=..."
//               />

//               <button
//                 onClick={() => removeVideoUrl(index)}
//                 className="px-3 rounded-lg bg-red-500 text-white"
//               >
//                 ✕
//               </button>
//             </div>
//           ))}

//           <button
//             type="button"
//             onClick={addVideoUrl}
//             className="text-sm text-indigo-600 hover:underline"
//           >
//             + Add another video
//           </button>
//         </div>

//         {loading && <p className="text-sm text-indigo-600">Saving gallery…</p>}
//       </div>
//     );
//   },
// );

// export default EditStepGallery;

// /* ================= IMAGE GRID ================= */

// function ImageGrid({
//   title,
//   images,
//   isSaved = false,
//   mainImageId,
//   onSelect,
//   onRemove,
// }) {
//   return (
//     <div className="space-y-3">
//       <p className="text-sm font-medium text-gray-700">{title}</p>

//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//         {images.map((img, i) => {
//           const isMain = isSaved && mainImageId === img.id;
//           const src = isSaved ? img.url : URL.createObjectURL(img);

//           return (
//             <div
//               key={isSaved ? img.id : i}
//               onClick={() => isSaved && onSelect(img.id)}
//               className={`relative rounded-xl overflow-hidden border cursor-pointer
//               ${
//                 isMain
//                   ? "ring-2 ring-indigo-500"
//                   : "hover:ring-2 hover:ring-gray-300"
//               }`}
//             >
//               {isMain && (
//                 <span
//                   className="absolute top-2 left-2 bg-indigo-600
//                 text-white text-xs px-2 py-0.5 rounded"
//                 >
//                   Main
//                 </span>
//               )}

//               <img src={src} className="h-32 w-full object-cover" alt="" />

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onRemove(isSaved ? img.id : i);
//                 }}
//                 className="absolute top-2 right-2 bg-black/70
//                 text-white text-xs px-2 py-0.5 rounded"
//               >
//                 ✕
//               </button>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// /* ================= ICON ================= */

// function UploadIcon() {
//   return (
//     <svg
//       className="w-10 h-10 text-gray-400"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       viewBox="0 0 24 24"
//     >
//       <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
//       <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
//     </svg>
//   );
// }

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import api from "../../../api/axios";

const EditStepGallery = forwardRef(
  ({ productId, existingImages = [], existingVideo = [] }, ref) => {
    const inputRef = useRef(null);

    /* ================= STATE ================= */

    const [savedImages, setSavedImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [mainImageId, setMainImageId] = useState(null);

    const [videoUrls, setVideoUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ================= LOAD EXISTING IMAGES ================= */

    useEffect(() => {
      if (!existingImages?.length) return;

      const mapped = existingImages.map((img) => ({
        id: img.id,
        url: img.url,
        is_primary: img.is_primary,
      }));

      setSavedImages(mapped);

      const primary = mapped.find((i) => i.is_primary);
      if (primary) setMainImageId(primary.id);
    }, [existingImages]);

    /* ================= LOAD EXISTING VIDEOS ================= */

    useEffect(() => {
      if (Array.isArray(existingVideo)) {
        setVideoUrls(existingVideo.map((v) => v.video_url));
      }
    }, [existingVideo]);

    /* ================= IMAGE HANDLERS ================= */

    const handleFiles = (files) => {
      setNewImages((prev) => [...prev, ...Array.from(files)]);
    };

    const removeSavedImage = async (id) => {
      try {
        await api.delete(`/admin-dashboard/product/image/${id}`);
        setSavedImages((prev) => prev.filter((i) => i.id !== id));
        if (mainImageId === id) setMainImageId(null);
      } catch {
        alert("Failed to delete image");
      }
    };

    const removeNewImage = (index) => {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    /* ================= VIDEO HANDLERS ================= */

    const addVideoUrl = () => setVideoUrls((p) => [...p, ""]);

    const removeVideoUrl = (index) => {
      setVideoUrls((p) => p.filter((_, i) => i !== index));
    };

    const updateVideoUrl = (index, value) => {
      const copy = [...videoUrls];
      copy[index] = value;
      setVideoUrls(copy);
    };

    /* ================= SAVE STEP ================= */

    useImperativeHandle(ref, () => ({
      async saveStep() {
        if (!productId) {
          alert("Product ID missing");
          return false;
        }

        try {
          setLoading(true);

          /* 1️⃣ UPLOAD NEW IMAGES */
          if (newImages.length > 0) {
            const fd = new FormData();
            newImages.forEach((file) => fd.append("images[]", file));

            await api.post(`/admin-dashboard/product/${productId}/images`, fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }

          /* 2️⃣ SET MAIN IMAGE */
          if (mainImageId) {
            await api.post(
              `/admin-dashboard/product/${productId}/set-main-image`,
              {
                image_id: mainImageId,
              },
            );
          }

          /* 3️⃣ UPDATE PRODUCT VIDEOS */
          const urls = videoUrls.filter((v) => v.trim());
          await api.post(`/admin-dashboard/product/${productId}/videos`, {
            video_urls: urls,
          });

          return true;
        } catch (err) {

          alert("Failed to save gallery");
          return false;
        } finally {
          setLoading(false);
        }
      },
    }));

    /* ================= UI ================= */

    return (
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        {/* HEADER */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Product Gallery
          </h3>
          <p className="text-sm text-gray-500">
            Manage images and product videos
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
            multiple
            accept="image/*"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* EXISTING IMAGES */}
        {savedImages.length > 0 && (
          <ImageGrid
            title="Existing Images"
            images={savedImages}
            isSaved
            mainImageId={mainImageId}
            onSelect={setMainImageId}
            onRemove={removeSavedImage}
          />
        )}

        {/* NEW IMAGES */}
        {newImages.length > 0 && (
          <ImageGrid
            title="New Images"
            images={newImages}
            onRemove={removeNewImage}
          />
        )}

        {/* VIDEO URLS */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Product Video URLs
          </label>

          {videoUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateVideoUrl(index, e.target.value)}
                className="input flex-1"
                placeholder="https://youtube.com/watch?v=..."
              />

              <button
                onClick={() => removeVideoUrl(index)}
                className="px-3 rounded-lg bg-red-500 text-white"
              >
                ✕
              </button>
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

        {loading && <p className="text-sm text-indigo-600">Saving gallery…</p>}
      </div>
    );
  },
);

export default EditStepGallery;

/* ================= IMAGE GRID ================= */

function ImageGrid({
  title,
  images,
  isSaved = false,
  mainImageId,
  onSelect,
  onRemove,
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">{title}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, i) => {
          const isMain = isSaved && mainImageId === img.id;
          const src = isSaved ? img.url : URL.createObjectURL(img);

          return (
            <div
              key={isSaved ? img.id : i}
              onClick={() => isSaved && onSelect(img.id)}
              className={`relative rounded-xl overflow-hidden border cursor-pointer
              ${
                isMain
                  ? "ring-2 ring-indigo-500"
                  : "hover:ring-2 hover:ring-gray-300"
              }`}
            >
              {isMain && (
                <span
                  className="absolute top-2 left-2 bg-indigo-600
                text-white text-xs px-2 py-0.5 rounded"
                >
                  Main
                </span>
              )}

              <img src={src} className="h-32 w-full object-cover" alt="" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(isSaved ? img.id : i);
                }}
                className="absolute top-2 right-2 bg-black/70
                text-white text-xs px-2 py-0.5 rounded"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
