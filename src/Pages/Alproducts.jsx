import { useContext, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import {
  Cartcontext,
  Categorycontext,
  Maincontext,
  NavbarContext,
  Wishlistcontext,
} from "../Contexts/contexts";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { X } from "lucide-react";
import {
  getDiscountPercent,
  getEffectivePrice,
  getProductImageUrl,
  handleImageError,
} from "../Axios";

const Alproducts = () => {
  const { data, fetchProducts, loading } = useContext(Maincontext);
  const { category } = useContext(Categorycontext);
  const { addcart } = useContext(Cartcontext);
  const { input, setInput } = useContext(NavbarContext);
  const { addwish, wishlistData } = useContext(Wishlistcontext);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const [sort, setSort] = useState("");

  useEffect(() => {
    fetchProducts(input, sort, selectedCategory);
  }, [sort, input, selectedCategory, fetchProducts]);

  const handleCategoryChange = (catId) => {
    const next = new URLSearchParams(searchParams);
    if (catId) {
      next.set("category", catId);
    } else {
      next.delete("category");
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSort("");
    setInput("");
    if (selectedCategory) {
      handleCategoryChange("");
    }
  };

  const isLiked = (id) =>
    Array.isArray(wishlistData) && wishlistData.some((item) => item._id === id);

  const activeCategories = Array.isArray(category)
    ? category.filter((c) => c.isActive !== false)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f3f6] text-slate-900">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Filter & Sort Bar */}
        <section className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                All Fragrances
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {loading
                  ? "Loading fragrances..."
                  : `${data.length} ${data.length === 1 ? "product" : "products"} found`}
                {input ? ` for "${input}"` : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(selectedCategory || input || sort) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0d2a46] hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-md transition"
                >
                  <X size={13} /> Clear filters
                </button>
              )}

              <div className="flex items-center gap-2 border border-slate-200 rounded-md px-2.5 py-1.5 bg-slate-50">
                <label
                  htmlFor="product-sort"
                  className="text-xs font-medium text-slate-600"
                >
                  Sort:
                </label>
                <select
                  id="product-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="">Latest</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Horizontal Category Chips */}
          {activeCategories.length > 0 && (
            <div
              className="flex items-center gap-2 overflow-x-auto pb-1 home-featured"
              role="region"
              aria-label="Filter by category"
            >
              <button
                type="button"
                onClick={() => handleCategoryChange("")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  selectedCategory === ""
                    ? "bg-[#0d2a46] text-white border-[#0d2a46]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-[#0d2a46]"
                }`}
              >
                All Scents
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleCategoryChange(cat._id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    selectedCategory === cat._id
                      ? "bg-[#0d2a46] text-white border-[#0d2a46]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-[#0d2a46]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 p-3 space-y-3 animate-pulse"
              >
                <div className="aspect-square bg-slate-100 rounded-md" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-8 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {data.map((item) => {
              const effectivePrice = getEffectivePrice(item);
              const discountPercent = getDiscountPercent(item);
              const outOfStock = item.stock <= 0;

              return (
                <article
                  key={item._id}
                  className="bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                >
                  <div className="relative bg-slate-50 aspect-square flex items-center justify-center p-3">
                    <Link
                      to={`/single/${item._id}`}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <img
                        src={getProductImageUrl(item.images)}
                        onError={handleImageError}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => addwish(item._id)}
                      aria-label={
                        isLiked(item._id)
                          ? `Remove ${item.name} from wishlist`
                          : `Add ${item.name} to wishlist`
                      }
                      className="absolute top-2 right-2 p-2 bg-white rounded-full border border-slate-200 shadow-xs hover:bg-slate-50 transition"
                    >
                      {isLiked(item._id) ? (
                        <FaHeart className="text-red-500 text-sm" />
                      ) : (
                        <FaRegHeart className="text-slate-400 text-sm" />
                      )}
                    </button>

                    {outOfStock && (
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 truncate">
                        {item.brand || item.category?.name || "Fragranzia"}
                      </p>
                      <Link to={`/single/${item._id}`} className="block mt-0.5">
                        <h2 className="text-sm font-medium text-slate-900 line-clamp-2 hover:text-[#0d2a46]">
                          {item.name}
                        </h2>
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-base font-bold text-slate-900">
                          ₹{effectivePrice}
                        </span>
                        {discountPercent > 0 && (
                          <>
                            <span className="text-xs text-slate-400 line-through">
                              ₹{item.price}
                            </span>
                            <span className="text-xs font-semibold text-emerald-700">
                              {discountPercent}% off
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => addcart(item._id)}
                        className={`w-full py-2 rounded-md text-xs font-semibold transition ${
                          outOfStock
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-[#0d2a46] text-white hover:bg-[#163d61] active:scale-[0.99]"
                        }`}
                      >
                        {outOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 py-14 px-6 text-center space-y-3">
            <p className="text-base font-semibold text-slate-800">
              No fragrances match your current filter.
            </p>
            <p className="text-xs text-slate-500">
              Try clearing your search or choosing a different scent category.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center px-4 py-2 rounded-md bg-[#0d2a46] text-white text-xs font-semibold hover:bg-[#163d61] transition"
            >
              Show All Fragrances
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Alproducts;
