import { useContext } from "react";
import { Link } from "react-router-dom";
import { Cartcontext, Wishlistcontext } from "../Contexts/contexts";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import {
  getDiscountPercent,
  getEffectivePrice,
  getProductImageUrl,
  handleImageError,
} from "../Axios";

const Wishlist = () => {
  const { wishlistData, addwish } = useContext(Wishlistcontext);
  const { addcart } = useContext(Cartcontext);

  const items = Array.isArray(wishlistData) ? wishlistData : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f3f6] text-slate-900">
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0d2a46] rounded-lg text-white">
              <Heart size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                My Wishlist ({items.length})
              </h1>
              <p className="text-xs text-slate-500">
                Saved fragrances ready whenever you are
              </p>
            </div>
          </div>
          <Link
            to="/product"
            className="text-xs sm:text-sm font-semibold text-[#0d2a46] hover:underline"
          >
            Explore All
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 py-16 px-6 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Heart size={26} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Your wishlist is empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Save fragrances you love to find them quickly later.
            </p>
            <Link
              to="/product"
              className="inline-block bg-[#0d2a46] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163d61] transition"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.map((item) => {
              const effectivePrice = getEffectivePrice(item);
              const discountPercent = getDiscountPercent(item);
              const unavailable =
                item.isActive === false || (item.stock ?? 0) < 1;

              return (
                <article
                  key={item._id}
                  className="bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-3">
                    <Link
                      to={`/single/${item._id}`}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <img
                        src={getProductImageUrl(item.images)}
                        onError={handleImageError}
                        alt={item.name}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => addwish(item._id)}
                      aria-label={`Remove ${item.name} from wishlist`}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full border border-slate-200 shadow-xs text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      <Link to={`/single/${item._id}`}>
                        <h2 className="text-sm font-medium text-slate-900 line-clamp-2 hover:text-[#0d2a46]">
                          {item.name}
                        </h2>
                      </Link>

                      <div className="flex flex-wrap items-baseline gap-1.5 mt-1.5">
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
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={unavailable}
                        onClick={() => addcart(item._id)}
                        className="flex items-center justify-center gap-1.5 bg-[#0d2a46] text-white py-2 px-2 rounded-md text-xs font-semibold hover:bg-[#163d61] transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart size={13} />
                        <span>{unavailable ? "Sold Out" : "Add"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addwish(item._id)}
                        className="flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 py-2 px-2 rounded-md text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
