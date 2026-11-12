import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cartcontext } from "../Contexts/contexts";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  getProductImageUrl,
  getSizePricing,
  handleImageError,
} from "../Axios";

const Cart = () => {
  const {
    cart,
    incrementqty,
    decrementqty,
    removeitem,
    fetchcartproduct,
    handlePlaceOrder,
  } = useContext(Cartcontext);

  useEffect(() => {
    fetchcartproduct();
  }, [fetchcartproduct]);

  const validCart = Array.isArray(cart) ? cart.filter((item) => item?.product) : [];

  const unavailableItems = validCart.filter(
    (item) =>
      item.product.isActive === false ||
      (item.product.stock ?? 0) < (item.quantity || 1)
  );
  const hasUnavailableItems = unavailableItems.length > 0;

  const mrpTotal = Math.floor(
    validCart.reduce(
      (total, item) =>
        total + getSizePricing(item.product, item.size).price * (item.quantity || 0),
      0
    )
  );
  const totalAmount = Math.floor(
    validCart.reduce(
      (total, item) =>
        total + getSizePricing(item.product, item.size).effectivePrice * (item.quantity || 0),
      0
    )
  );
  const totalDiscount = Math.max(0, mrpTotal - totalAmount);
  const totalItemsCount = validCart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f3f6] text-slate-900">
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            My Cart ({totalItemsCount})
          </h1>
          <Link
            to="/product"
            className="text-xs sm:text-sm font-semibold text-[#0d2a46] hover:underline"
          >
            Continue Shopping
          </Link>
        </div>

        {validCart.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 py-16 px-6 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag size={26} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Your cart is empty</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Add fragrances to your cart to review prices and checkout.
            </p>
            <Link
              to="/product"
              className="inline-block bg-[#0d2a46] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163d61] transition"
            >
              Shop Fragrances
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* LEFT SIDE - CART ITEMS */}
            <div className="lg:col-span-8 space-y-3">
              {validCart.map((item) => {
                const qty = item.quantity || 1;
                const {
                  price: itemMrp,
                  effectivePrice: unitPrice,
                  discountPercent,
                  size: displaySize,
                } = getSizePricing(item.product, item.size);
                const itemSizeKey = item.size ?? "";
                const isUnavailable =
                  item.product.isActive === false ||
                  (item.product.stock ?? 0) < qty;

                return (
                  <article
                    key={`${item.product._id}-${itemSizeKey || "default"}`}
                    className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col sm:flex-row gap-4"
                  >
                    <Link
                      to={`/single/${item.product._id}`}
                      className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-slate-50 rounded-md p-2 flex items-center justify-center self-center sm:self-start border border-slate-100"
                    >
                      <img
                        src={getProductImageUrl(item.product.images)}
                        onError={handleImageError}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          {item.product.brand ||
                            item.product.category?.name ||
                            "Fragranzia"}
                        </p>
                        <Link to={`/single/${item.product._id}`}>
                          <h2 className="text-sm sm:text-base font-semibold text-slate-900 hover:text-[#0d2a46] truncate">
                            {item.product.name}
                          </h2>
                        </Link>
                        {displaySize && (
                          <span className="inline-block mt-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Size: {displaySize}
                          </span>
                        )}

                        <div className="flex flex-wrap items-baseline gap-2 mt-1.5">
                          <span className="text-lg font-bold text-slate-900">
                            ₹{unitPrice * qty}
                          </span>
                          {discountPercent > 0 && (
                            <>
                              <span className="text-xs text-slate-400 line-through">
                                ₹{itemMrp * qty}
                              </span>
                              <span className="text-xs font-semibold text-emerald-700">
                                {discountPercent}% off
                              </span>
                            </>
                          )}
                        </div>

                        {isUnavailable && (
                          <p className="mt-2 inline-block text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded">
                            {item.product.isActive === false
                              ? "Currently unavailable — please remove from cart"
                              : `Only ${item.product.stock ?? 0} left in stock`}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="inline-flex items-center border border-slate-300 rounded-md overflow-hidden">
                          <button
                            type="button"
                            onClick={() => decrementqty(item.product._id, item.size)}
                            aria-label={`Decrease quantity of ${item.product.name}`}
                            className="p-2 text-slate-700 hover:bg-slate-100 transition"
                          >
                            <Minus size={14} />
                          </button>
                          <span
                            aria-live="polite"
                            className="px-3.5 py-1 text-sm font-semibold text-slate-900 bg-slate-50 border-x border-slate-300"
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementqty(item.product._id, item.size)}
                            aria-label={`Increase quantity of ${item.product.name}`}
                            className="p-2 text-slate-700 hover:bg-slate-100 transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeitem(item.product._id, item.size)}
                          aria-label={`Remove ${item.product.name} from cart`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* RIGHT SIDE – PRICE DETAILS */}
            <aside className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-4 sm:p-5 lg:sticky lg:top-20 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100">
                Price Details
              </h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>Price ({totalItemsCount} items)</span>
                  <span>₹{mrpTotal}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>−₹{totalDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-700">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-emerald-700">FREE</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-base font-bold text-slate-900">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>

              {totalDiscount > 0 && (
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                  You will save ₹{totalDiscount} on this order
                </p>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={hasUnavailableItems}
                className="w-full bg-[#0d2a46] text-white font-bold text-sm py-3 rounded-lg hover:bg-[#163d61] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasUnavailableItems ? "Remove Unavailable Items" : "Place Order"}
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
