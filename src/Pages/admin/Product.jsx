import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAdminService from "../../service/admin-api-service/adminservice";
import { Plus, Search, Edit3, Ban, Check, Trash2, Star } from "lucide-react";
import { getProductImageUrl, getEffectivePrice, handleImageError } from "../../Axios";

const Product = () => {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { getProductData, deleteProductData, putProductData } = useAdminService();

  const fetchproduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProductData();
      setProduct(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getProductData]);

  useEffect(() => {
    fetchproduct();
  }, [fetchproduct]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProductData(id);
        toast.success("Product deleted");
        fetchproduct();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to delete product");
      }
    }
  };

  const handleToggleBlock = async (id, currentStatus) => {
    try {
      await putProductData(id, { isActive: currentStatus === false });
      toast.success(currentStatus === false ? "Product enabled" : "Product hidden");
      fetchproduct();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      await putProductData(id, { isFeatured: !currentFeatured });
      toast.success(!currentFeatured ? "Marked as featured" : "Removed from featured");
      fetchproduct();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update featured flag");
    }
  };

  const filteredProducts = product.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4 sm:p-6 space-y-4 text-slate-900">
      {/* Header */}
      <header className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Products ({product.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit, feature, or control storefront visibility of perfumes
          </p>
        </div>

        <Link
          to="/productadding"
          className="inline-flex items-center justify-center gap-1.5 bg-[#0d2a46] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#163d61] transition w-fit"
        >
          <Plus size={15} /> Add Product
        </Link>
      </header>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          aria-label="Search products"
          placeholder="Search by product name, brand, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:border-[#0d2a46]"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-10 bg-slate-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isActive = p.isActive !== false;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-md bg-slate-50 border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                            <img
                              src={getProductImageUrl(p.images)}
                              onError={handleImageError}
                              className="h-full w-full object-contain"
                              alt={p.name}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate max-w-[200px]">
                              {p.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {p.brand ? `${p.brand} • ` : ""}#{p._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                          {p.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              p.stock > 10 ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {p.stock} units
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-bold text-slate-900">
                          ₹{getEffectivePrice(p)}
                        </p>
                        {p.saleprice > 0 && p.saleprice < p.price && (
                          <p className="text-xs text-slate-400 line-through">₹{p.price}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {isActive ? <Check size={12} /> : <Ban size={12} />}
                          {isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(p._id, p.isFeatured)}
                            aria-label={
                              p.isFeatured
                                ? `Remove ${p.name} from featured`
                                : `Mark ${p.name} as featured`
                            }
                            title={p.isFeatured ? "Unfeature" : "Mark Featured"}
                            className={`p-2 rounded-md transition ${
                              p.isFeatured
                                ? "bg-[#0d2a46] text-white"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            <Star size={14} fill={p.isFeatured ? "currentColor" : "none"} />
                          </button>

                          <Link
                            to={`/productadding/${p._id}`}
                            aria-label={`Edit ${p.name}`}
                            className="p-2 bg-slate-100 text-[#0d2a46] rounded-md hover:bg-[#0d2a46] hover:text-white transition"
                          >
                            <Edit3 size={14} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleToggleBlock(p._id, p.isActive)}
                            aria-label={isActive ? `Hide ${p.name}` : `Show ${p.name}`}
                            title={isActive ? "Hide from store" : "Show in store"}
                            className={`p-2 rounded-md transition ${
                              isActive
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                            }`}
                          >
                            {isActive ? <Ban size={14} /> : <Check size={14} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(p._id)}
                            aria-label={`Delete ${p.name}`}
                            className="p-2 bg-rose-50 text-rose-700 rounded-md hover:bg-rose-600 hover:text-white transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    No matching products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Product;
