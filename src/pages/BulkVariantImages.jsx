
import { useEffect, useState } from "react";
import api from "../api/axios";
import useDynamicTitle from "../hooks/useDynamicTitle";

export default function BulkVariantImages() {

  useDynamicTitle("Product & Variant Images");

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [variantImages, setVariantImages] = useState({});
  const [productImages, setProductImages] = useState({});

  const [previewVariantImages, setPreviewVariantImages] = useState({});
  const [previewProductImages, setPreviewProductImages] = useState({});

  const [uploading, setUploading] = useState(false);

  /* ================= FETCH ================= */

  const fetchVariants = async () => {
    try {

      setLoading(true);

      const res = await api.get("/admin-dashboard/product-variants", {
        params: { search: query, page, perPage }
      });

      setVariants(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);

    } catch (err) {

      console.error("FETCH ERROR:", err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchVariants();
  }, [query, page]);

  /* ================= SELECT IMAGES ================= */

  const handleVariantImageChange = (variantId, files) => {

    const fileArray = Array.from(files);

    setVariantImages(prev => ({
      ...prev,
      [variantId]: fileArray
    }));

    const previews = fileArray.map(file =>
      URL.createObjectURL(file)
    );

    setPreviewVariantImages(prev => ({
      ...prev,
      [variantId]: previews
    }));

  };

  const handleProductImageChange = (productId, files) => {

    const fileArray = Array.from(files);

    setProductImages(prev => ({
      ...prev,
      [productId]: fileArray
    }));

    const previews = fileArray.map(file =>
      URL.createObjectURL(file)
    );

    setPreviewProductImages(prev => ({
      ...prev,
      [productId]: previews
    }));

  };

  /* ================= DELETE ================= */

  const deleteVariantImage = async (id) => {

    if (!window.confirm("Delete variant image?")) return;

    try {

      await api.delete(`/admin-dashboard/delete-variant-image/${id}`);
      fetchVariants();

    } catch {

      alert("Delete failed");

    }
  };

  const deleteProductImage = async (id) => {

    if (!window.confirm("Delete product image?")) return;

    try {

      await api.delete(`/admin-dashboard/delete-product-image/${id}`);
      fetchVariants();

    } catch {

      alert("Delete failed");

    }
  };

  /* ================= UPLOAD ================= */

  const uploadImages = async () => {

    const formData = new FormData();

    Object.entries(variantImages).forEach(([variantId, files]) => {

      files.forEach(file => {
        formData.append(`variant_images[${variantId}][]`, file);
      });

    });

    Object.entries(productImages).forEach(([productId, files]) => {

      files.forEach(file => {
        formData.append(`product_images[${productId}][]`, file);
      });

    });

    try {

      setUploading(true);

      const res = await api.post(
        "/admin-dashboard/bulk-product-variant-images",
        formData
      );

      alert(`Uploaded ${res.data.uploaded} images`);

      setVariantImages({});
      setProductImages({});
      setPreviewVariantImages({});
      setPreviewProductImages({});

      fetchVariants();

    } catch (err) {

      console.error(err);
      alert("Upload failed");

    } finally {

      setUploading(false);

    }
  };

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-semibold">
          Product & Variant Image Manager
        </h1>

       <div className="flex gap-2">

  <input
    placeholder="Search product or SKU"
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    onKeyDown={(e)=>{
      if(e.key==="Enter"){
        setQuery(search);
        setPage(1);
      }
    }}
    className="border px-3 py-2 rounded-lg"
  />

  <button
    onClick={()=>{
      setQuery(search);
      setPage(1);
    }}
    className="bg-gray-100 border px-4 py-2 rounded-lg"
  >
    Search
  </button>

  <button
    onClick={()=>{
      setSearch("");
      setQuery("");
      setPage(1);
    }}
    className="bg-red-100 border px-4 py-2 rounded-lg"
  >
    Reset
  </button>

</div>

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product Images</th>
              <th className="px-4 py-3">Variant Images</th>
              <th className="px-4 py-3">Upload</th>

            </tr>

          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && variants.map((v,i)=>(

              <tr key={v.id} className="border-t">

                <td className="px-4 py-3">
                  {(page-1)*perPage+i+1}
                </td>

                <td className="px-4 py-3 font-medium">
                  {v.product_name}
                </td>

                <td className="px-4 py-3">
                  {v.variation_values?.join(" / ") || "-"}
                </td>

                <td className="px-4 py-3">
                  {v.sku}
                </td>

                {/* PRODUCT IMAGES */}

                <td className="px-4 py-3">

                  <div className="flex gap-2 flex-wrap">

                    {v.product_images?.map(img=>(
                      <div key={img.id} className="relative">

                        <img
                          src={img.url}
                          className="w-12 h-12 object-cover border rounded"
                        />

                        <button
                          onClick={()=>deleteProductImage(img.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded"
                        >
                          ✕
                        </button>

                      </div>
                    ))}

                  </div>

                  {previewProductImages[v.product_id] && (

                    <div className="flex gap-2 mt-2">

                      {previewProductImages[v.product_id].map((p,i)=>(
                        <img
                          key={i}
                          src={p}
                          className="w-12 h-12 border rounded"
                        />
                      ))}

                    </div>

                  )}

                </td>

                {/* VARIANT IMAGES */}

                <td className="px-4 py-3">

                  <div className="flex gap-2 flex-wrap">

                    {v.variant_images?.map(img=>(
                      <div key={img.id} className="relative">

                        <img
                          src={img.url}
                          className="w-12 h-12 object-cover border rounded"
                        />

                        <button
                          onClick={()=>deleteVariantImage(img.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded"
                        >
                          ✕
                        </button>

                      </div>
                    ))}

                  </div>

                  {previewVariantImages[v.id] && (

                    <div className="flex gap-2 mt-2">

                      {previewVariantImages[v.id].map((p,i)=>(
                        <img
                          key={i}
                          src={p}
                          className="w-12 h-12 border rounded"
                        />
                      ))}

                    </div>

                  )}

                </td>

                {/* UPLOAD */}

                {/* <td className="px-4 py-3">

                  <div className="space-y-2">

                    <input
                      type="file"
                      multiple
                      onChange={(e)=>handleProductImageChange(
                        v.product_id,
                        e.target.files
                      )}
                    />

                    <input
                      type="file"
                      multiple
                      onChange={(e)=>handleVariantImageChange(
                        v.id,
                        e.target.files
                      )}
                    />

                  </div>

                </td> */}


                <div className="flex flex-col gap-2">

  {/* PRODUCT IMAGE UPLOAD */}

  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border px-3 py-2 rounded text-sm flex items-center justify-center">

    📦 Product Images

    <input
      type="file"
      multiple
      hidden
      onChange={(e)=>
        handleProductImageChange(
          v.product_id,
          e.target.files
        )
      }
    />

  </label>

  {productImages[v.product_id] && (
    <span className="text-xs text-gray-500">
      {productImages[v.product_id].length} selected
    </span>
  )}

  {/* VARIANT IMAGE UPLOAD */}

  <label className="cursor-pointer bg-indigo-100 hover:bg-indigo-200 border px-3 py-2 rounded text-sm flex items-center justify-center">

    🎨 Variant Images

    <input
      type="file"
      multiple
      hidden
      onChange={(e)=>
        handleVariantImageChange(
          v.id,
          e.target.files
        )
      }
    />

  </label>

  {variantImages[v.id] && (
    <span className="text-xs text-gray-500">
      {variantImages[v.id].length} selected
    </span>
  )}

</div>

              </tr>

            ))}

          </tbody>

        </table>

        {/* PAGINATION */}

        <div className="flex justify-center gap-2 py-4">

          <button
            disabled={page===1}
            onClick={()=>setPage(page-1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>

          {Array.from({length:totalPages}).map((_,i)=>(
            <button
              key={i}
              onClick={()=>setPage(i+1)}
              className={`px-3 py-1 border rounded ${
                page===i+1 ? "bg-indigo-600 text-white":""
              }`}
            >
              {i+1}
            </button>
          ))}

          <button
            disabled={page===totalPages}
            onClick={()=>setPage(page+1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>

        </div>

      </div>

      {/* UPLOAD BUTTON */}

      <div className="flex justify-end">

        <button
          onClick={uploadImages}
          disabled={uploading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>

      </div>

    </div>

  );

}

