import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Categorycontext } from "../../Contexts/contexts";
import useAdminService from "../../service/admin-api-service/adminservice";
import { UploadCloud, X, Check, ArrowLeft } from "lucide-react";
import { IMAGE_URL, handleImageError } from "../../Axios";

const Productadding = () => {
  const { category } = useContext(Categorycontext);
  const { postProductData, putProductData, getProductData } = useAdminService();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    saleprice: "",
    category: "",
    stock: "",
    sizes: "",
    variants: "",
    isFeatured: false,
    isActive: true,
  });

  const [image, setImage] = useState(null);
  const [existingImg, setExistingImg] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const previewUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    getProductData()
      .then((res) => {
        if (!active) return;
        const currentProduct = res.data?.find((p) => p._id === id);
        if (currentProduct) {
          setProduct({
            name: currentProduct.name || "",
            brand: currentProduct.brand || "",
            description: currentProduct.description || "",
            price: currentProduct.price ?? "",
            saleprice: currentProduct.saleprice ?? "",
            category: currentProduct.category?._id || currentProduct.category || "",
            stock: currentProduct.stock ?? "",
            sizes: Array.isArray(currentProduct.sizes) ? currentProduct.sizes.join(", ") : "",
            variants: Array.isArray(currentProduct.variants) ? currentProduct.variants.join(", ") : "",
            isFeatured: Boolean(currentProduct.isFeatured),
            isActive: currentProduct.isActive !== false,
          });
          setExistingImg(currentProduct.images?.[0] || "");
        }
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      active = false;
    };
  }, [isEditing, getProductData, id]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    setImage(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      previewUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl("");
    }
  };

  const handlechange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({ ...product, [name]: type === "checkbox" ? checked : value });
  };

  async function onhandlesubmit(e) {
    e.preventDefault();
    if (submitting) return;

    if (!isEditing && !image) {
      toast.error("Please upload a product image");
      return;
    }

    const numericPrice = Number(product.price);
    const numericSale = product.saleprice !== "" ? Number(product.saleprice) : null;
    if (numericSale !== null && numericSale >= numericPrice) {
      toast.error("Sale price must be less than base price");
      return;
    }

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("brand", product.brand);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("saleprice", product.saleprice);
    formData.append("category", product.category);
    formData.append("stock", product.stock);
    formData.append("sizes", product.sizes);
    formData.append("variants", product.variants);
    formData.append("isFeatured", String(product.isFeatured));
    formData.append("isActive", String(product.isActive));
    if (image) formData.append("image", image);

    try {
      setSubmitting(true);
      if (isEditing) {
        await putProductData(id, formData);
        toast.success("Product updated successfully");
      } else {
        await postProductData(formData);
        toast.success("Product created successfully");
      }
      navigate("/adproduct");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4 sm:p-6 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/adproduct")}
              aria-label="Back to products"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d2a46] transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-xs text-slate-500">
                Configure fragrance details, pricing, stock, and visibility
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={onhandlesubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-4">
            <section className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name
                  </label>
                  <input
                    id="prod-name"
                    onChange={handlechange}
                    name="name"
                    value={product.name}
                    type="text"
                    placeholder="e.g., Midnight Jasmine"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="prod-brand" className="block text-xs font-semibold text-slate-700 mb-1">
                    Brand / House
                  </label>
                  <input
                    id="prod-brand"
                    onChange={handlechange}
                    name="brand"
                    value={product.brand}
                    type="text"
                    placeholder="e.g., Fragranzia Atelier"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#0d2a46]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prod-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="prod-desc"
                  onChange={handlechange}
                  name="description"
                  value={product.description}
                  rows={4}
                  placeholder="Describe scent notes, occasion, and longevity..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#0d2a46] resize-y"
                  required
                />
              </div>
            </section>

            <section className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Pricing, Stock & Variants
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="prod-price" className="block text-xs font-semibold text-slate-700 mb-1">
                    MRP / Base Price (₹)
                  </label>
                  <input
                    id="prod-price"
                    onChange={handlechange}
                    name="price"
                    value={product.price}
                    type="number"
                    min="1"
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="prod-saleprice" className="block text-xs font-semibold text-slate-700 mb-1">
                    Sale Price (₹)
                  </label>
                  <input
                    id="prod-saleprice"
                    onChange={handlechange}
                    name="saleprice"
                    value={product.saleprice}
                    type="number"
                    min="0"
                    placeholder="Optional"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-emerald-700 outline-none focus:border-[#0d2a46]"
                  />
                </div>

                <div>
                  <label htmlFor="prod-stock" className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    id="prod-stock"
                    onChange={handlechange}
                    value={product.stock}
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-sizes" className="block text-xs font-semibold text-slate-700 mb-1">
                    Available Sizes (comma separated)
                  </label>
                  <input
                    id="prod-sizes"
                    onChange={handlechange}
                    value={product.sizes}
                    name="sizes"
                    type="text"
                    placeholder="30ml, 50ml, 100ml"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#0d2a46]"
                  />
                </div>

                <div>
                  <label htmlFor="prod-variants" className="block text-xs font-semibold text-slate-700 mb-1">
                    Variants / Concentration
                  </label>
                  <input
                    id="prod-variants"
                    onChange={handlechange}
                    value={product.variants}
                    name="variants"
                    type="text"
                    placeholder="Eau de Parfum, Intense"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#0d2a46]"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-4">
            <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Product Image</h2>

              <label className="relative block cursor-pointer group">
                <input
                  onChange={handleImageChange}
                  type="file"
                  accept="image/*"
                  aria-label="Upload product image"
                  className="sr-only"
                />
                <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center overflow-hidden group-hover:border-[#0d2a46] transition">
                  {previewUrl || existingImg ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <img
                        src={previewUrl || `${IMAGE_URL}/${existingImg}`}
                        onError={handleImageError}
                        className="max-h-[82%] max-w-full object-contain rounded"
                        alt="Product preview"
                      />
                      <span className="text-xs font-semibold text-[#0d2a46] shrink-0">
                        Click to replace image
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={26} className="text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click to upload image
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        PNG, JPG, WebP (Max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </label>
            </section>

            <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div>
                <label htmlFor="prod-category" className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  id="prod-category"
                  onChange={handlechange}
                  name="category"
                  value={product.category}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0d2a46] cursor-pointer"
                  required
                >
                  <option value="">Select Category</option>
                  {category.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">
                    Featured on Homepage
                  </span>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={product.isFeatured}
                    onChange={handlechange}
                    className="w-4 h-4 accent-[#0d2a46]"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">
                    Visible on Storefront
                  </span>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={product.isActive}
                    onChange={handlechange}
                    className="w-4 h-4 accent-[#0d2a46]"
                  />
                </label>
              </div>
            </section>

            <div className="flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-[#0d2a46] text-white text-xs font-bold hover:bg-[#163d61] transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Check size={15} />
                {submitting ? "Saving..." : isEditing ? "Save Changes" : "Publish Product"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/adproduct")}
                className="w-full py-2.5 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-2"
              >
                <X size={15} /> Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Productadding;
