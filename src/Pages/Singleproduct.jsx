import { useContext, useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Cartcontext, Maincontext, Wishlistcontext } from "../Contexts/contexts";
import useUserService from "../service/user-api-service/UserService";
import {
  getEffectivePrice,
  getProductImageUrl,
  getSizePricing,
  handleImageError,
  IMAGE_URL,
} from "../Axios";
import { FaHeart, FaRegHeart, FaTag, FaStar, FaTruckFast, FaArrowsRotate } from "react-icons/fa6";
import { ShoppingBag, Zap } from "lucide-react";

const Singleproduct = () => {
  const { addwish, wishlistData } = useContext(Wishlistcontext);
  const { addcart } = useContext(Cartcontext);
  const { data } = useContext(Maincontext);
  const { getSingleProductAPI } = useUserService();
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingNow, setBuyingNow] = useState(false);

  // Scope selections to the current product id so switching products resets selections cleanly
  const [imgSelection, setImgSelection] = useState({ id: null, src: "" });
  const [sizeSelection, setSizeSelection] = useState({ id: null, value: "" });
  const [variantSelection, setVariantSelection] = useState({ id: null, value: "" });

  const contextProduct = data.find((item) => item._id === id);
  const product = contextProduct || fetchedProduct;

  const mainImg =
    (imgSelection.id === id ? imgSelection.src : "") || product?.images?.[0] || "";
  const activeSize =
    (sizeSelection.id === id ? sizeSelection.value : "") || product?.sizes?.[0] || "";
  const activeVariant =
    (variantSelection.id === id ? variantSelection.value : "") || product?.variants?.[0] || "";

  const {
    price: displayMrp,
    effectivePrice,
    discountPercent,
  } = getSizePricing(product, activeSize);
  const stockCount = product?.stock ?? 0;
  const outOfStock = stockCount < 1 || product?.isActive === false;
  const isLiked =
    Array.isArray(wishlistData) && wishlistData.some((item) => item._id === product?._id);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;

    const loadProduct = async () => {
      if (contextProduct) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getSingleProductAPI(id);
        if (active) {
          setFetchedProduct(res.data || null);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        if (active) setFetchedProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      active = false;
    };
  }, [id, contextProduct, getSingleProductAPI]);

  const handleBuyNow = async () => {
    if (outOfStock || buyingNow) return;
    try {
      setBuyingNow(true);
      const ok = await addcart(product._id, activeSize);
      if (ok) {
        navigate("/checkout");
      }
    } finally {
      setBuyingNow(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d2a46] mb-3" />
          <p className="text-sm text-slate-600 font-medium">Loading fragrance details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full space-y-3">
            <h1 className="text-xl font-bold text-slate-900">Fragrance Not Found</h1>
            <p className="text-sm text-slate-500">
              This scent may no longer be available.
            </p>
            <Link
              to="/product"
              className="inline-block bg-[#0d2a46] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163d61] transition"
            >
              Browse All Fragrances
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const imagesList = Array.isArray(product.images) ? product.images : [];
  const suggestedProducts = data.filter((item) => item._id !== product._id).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[#0d2a46]">Home</Link>
          <span>/</span>
          <Link to="/product" className="hover:text-[#0d2a46]">All Fragrances</Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <Link
                to={`/product?category=${product.category._id}`}
                className="hover:text-[#0d2a46]"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Main 2-column Flipkart-style Product Card */}
        <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT: Image Gallery & Primary Actions */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative bg-slate-50 border border-slate-200 rounded-lg aspect-square flex items-center justify-center p-6 overflow-hidden">
                <img
                  src={mainImg ? `${IMAGE_URL}/${mainImg}` : getProductImageUrl(product.images)}
                  onError={handleImageError}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  alt={product.name}
                />

                <button
                  type="button"
                  onClick={() => addwish(product._id)}
                  aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                  className="absolute top-3 right-3 p-2.5 bg-white rounded-full border border-slate-200 shadow-xs hover:bg-slate-50 transition"
                >
                  {isLiked ? (
                    <FaHeart className="text-red-500 text-base" />
                  ) : (
                    <FaRegHeart className="text-slate-400 text-base" />
                  )}
                </button>
              </div>

              {imagesList.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {imagesList.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`View product image ${i + 1}`}
                      onClick={() => setImgSelection({ id, src: img })}
                      className={`w-16 h-16 shrink-0 rounded-md p-1.5 border bg-slate-50 transition ${
                        mainImg === img
                          ? "border-[#0d2a46] ring-2 ring-[#0d2a46]/20"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={`${IMAGE_URL}/${img}`}
                        onError={handleImageError}
                        className="w-full h-full object-contain"
                        alt={`${product.name} view ${i + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Side-by-side Add to Cart & Buy Now */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => addcart(product._id, activeSize)}
                  disabled={outOfStock}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold border border-[#0d2a46] text-[#0d2a46] bg-white hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={16} />
                  {outOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={outOfStock || buyingNow}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold bg-[#0d2a46] text-white hover:bg-[#163d61] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap size={16} />
                  {buyingNow ? "Please wait..." : "Buy Now"}
                </button>
              </div>
            </div>

            {/* RIGHT: Details */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#0d2a46] bg-slate-100 px-2.5 py-1 rounded">
                    {product.brand || product.category?.name || "Signature Scent"}
                  </span>
                  {outOfStock ? (
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded">
                      Out of Stock
                    </span>
                  ) : stockCount <= 5 ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded">
                      Only {stockCount} left
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                      In Stock
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">
                    {product.rating || 4.8} <FaStar className="text-[10px]" />
                  </span>
                  <span className="text-slate-500 font-medium">
                    ({product.numReviews || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-baseline gap-2.5 pb-4 border-b border-slate-100">
                <span className="text-3xl font-bold text-slate-900">
                  ₹{effectivePrice}
                </span>
                {discountPercent > 0 && (
                  <>
                    <span className="text-base text-slate-400 line-through">
                      ₹{displayMrp}
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      {discountPercent}% off
                    </span>
                  </>
                )}
                {activeSize && (
                  <span className="text-xs font-medium text-slate-500 ml-auto">
                    Selected: <strong className="text-slate-700">{activeSize}</strong>
                  </span>
                )}
              </div>

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSizeSelection({ id, value: size })}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition ${
                          activeSize === size
                            ? "bg-[#0d2a46] text-white border-[#0d2a46]"
                            : "bg-white text-slate-700 border-slate-300 hover:border-[#0d2a46]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Variant
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setVariantSelection({ id, value: variant })}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition ${
                          activeVariant === variant
                            ? "bg-[#0d2a46] text-white border-[#0d2a46]"
                            : "bg-white text-slate-700 border-slate-300 hover:border-[#0d2a46]"
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Description
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description ||
                    "A balanced signature fragrance crafted for lasting daily wear."}
                </p>
              </div>

              {/* Delivery & Returns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <FaTruckFast className="text-[#0d2a46] text-lg shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Free Express Delivery</p>
                    <p className="text-[11px] text-slate-500">Fast doorstep shipping</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <FaArrowsRotate className="text-[#0d2a46] text-lg shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">30-Day Return Policy</p>
                    <p className="text-[11px] text-slate-500">Easy unopened returns</p>
                  </div>
                </div>
              </div>

              {/* Offers */}
              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Available Offers
                </h2>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <FaTag className="text-emerald-700 shrink-0" />
                    <span>15% off on your first order</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTag className="text-emerald-700 shrink-0" />
                    <span>Complimentary sample included with every order</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Suggested Products */}
        {suggestedProducts.length > 0 && (
          <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Similar Fragrances</h2>
                <p className="text-xs text-slate-500">More scents you might enjoy</p>
              </div>
              <Link
                to="/product"
                className="text-xs font-bold text-[#0d2a46] hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {suggestedProducts.map((value) => (
                <Link
                  key={value._id}
                  to={`/single/${value._id}`}
                  className="bg-white rounded-lg border border-slate-200 hover:shadow-md transition p-3 flex flex-col gap-2"
                >
                  <div className="aspect-square bg-slate-50 rounded-md p-3 flex items-center justify-center">
                    <img
                      src={getProductImageUrl(value.images)}
                      onError={handleImageError}
                      className="w-full h-full object-contain"
                      alt={value.name}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 truncate">
                      {value.category?.name || value.brand || "Fragrance"}
                    </p>
                    <h3 className="text-sm font-medium text-slate-900 truncate">
                      {value.name}
                    </h3>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      ₹{getEffectivePrice(value)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Singleproduct;
