import { useContext, useEffect, useRef, useState } from "react";
import {
  BanknotesIcon,
  CreditCardIcon,
  PhoneIcon,
  PlusIcon,
  MapPinIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  AddressContext,
  Cartcontext,
  Checkoutcontext,
} from "../Contexts/contexts";
import useUserService from "../service/user-api-service/UserService";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { getProductImageUrl, getSizePricing, handleImageError } from "../Axios";
import {
  launchRazorpayCheckout,
  PENDING_PAYMENT_KEY,
} from "../utils/razorpayCheckout";

const Checkout = () => {
  const navigate = useNavigate();
  const { address, setAddress, addAddress, fetchedAddress, getAddresses } =
    useContext(AddressContext);
  const { editshow, setEditshow } = useContext(Checkoutcontext);
  const { cart, fetchcartproduct, removeitem } = useContext(Cartcontext);
  const { ordering, verifyPaymentAPI, reportClientFailureAPI } = useUserService();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [pendingRecoveryOrderId, setPendingRecoveryOrderId] = useState(() =>
    localStorage.getItem(PENDING_PAYMENT_KEY)
  );
  const idempotencyKeyRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `chk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  );

  useEffect(() => {
    getAddresses();
  }, [getAddresses]);

  useEffect(() => {
    if (fetchedAddress.length > 0) {
      const defaultAddr = fetchedAddress.find((a) => a.isDefault);
      setSelectedAddress(defaultAddr || fetchedAddress[0]);
    } else {
      setSelectedAddress(null);
    }
  }, [fetchedAddress]);

  const validCart = Array.isArray(cart) ? cart.filter((item) => item?.product) : [];

  const hasUnavailableItems = validCart.some(
    (item) =>
      item.product.isActive === false ||
      (item.product.stock ?? 0) < (item.quantity || 1)
  );

  const mrpTotal = Math.floor(
    validCart.reduce(
      (acc, item) =>
        acc + getSizePricing(item.product, item.size).price * (item.quantity || 0),
      0
    )
  );
  const totalPrice = Math.floor(
    validCart.reduce(
      (acc, item) =>
        acc + getSizePricing(item.product, item.size).effectivePrice * (item.quantity || 0),
      0
    )
  );
  const totalDiscount = Math.max(0, mrpTotal - totalPrice);

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAddress(address);
      setEditshow(false);
    } catch {
      // toast already handled in AddressContext
    }
  };

  const Paynow = async () => {
    if (!selectedAddress) {
      toast.error("Please select or add a shipping address");
      return;
    }

    if (validCart.length === 0 || placingOrder) return;

    if (hasUnavailableItems) {
      toast.error("Please remove unavailable or out-of-stock items from your cart first.");
      navigate("/cart");
      return;
    }

    const items = validCart.map((item) => {
      const { effectivePrice, size } = getSizePricing(item.product, item.size);
      return {
        productId: item.product._id,
        name: item.product.name,
        price: effectivePrice,
        size,
        quantity: item.quantity,
      };
    });

    const orderData = {
      items,
      totalAmount: totalPrice,
      address: selectedAddress,
      paymentMethod,
      idempotencyKey: idempotencyKeyRef.current,
    };

    try {
      setPlacingOrder(true);
      const res = await ordering(orderData);

      if (res.success) {
        if (res.paymentMethod === "UPI") {
          setPendingRecoveryOrderId(res?.order?._id || null);
          await launchRazorpayCheckout({
            razorpayOrder: res?.razorpayOrder,
            orderRecord: res?.order,
            verifyPaymentAPI,
            reportClientFailureAPI,
            fetchcartproduct,
            navigate,
            prefill: {
              name: selectedAddress.fullName,
              contact: selectedAddress.phone,
            },
          });
        } else {
          await fetchcartproduct();
          navigate("/OrderSuccessPage", {
            state: { order: res?.order, address: selectedAddress, cartItems: validCart },
          });
        }
      }
    } catch (error) {
      toast.error(`Order failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f3f6] text-slate-900">
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h1>
          <Link to="/cart" className="text-xs sm:text-sm font-semibold text-[#0d2a46] hover:underline">
            ← Back to Cart
          </Link>
        </div>

        {pendingRecoveryOrderId && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                You have an interrupted payment session for order{" "}
                <strong className="font-mono">
                  #{pendingRecoveryOrderId.slice(-8).toUpperCase()}
                </strong>
                . Check status before paying again to avoid duplicate charges.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/payment-status/${pendingRecoveryOrderId}`}
                className="px-3 py-1.5 rounded bg-[#0d2a46] text-white font-semibold hover:bg-[#163d61] transition"
              >
                Check Status / Resume
              </Link>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(PENDING_PAYMENT_KEY);
                  setPendingRecoveryOrderId(null);
                }}
                className="px-2.5 py-1.5 rounded border border-amber-300 text-amber-800 font-semibold hover:bg-amber-100 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. DELIVERY ADDRESS */}
            <section className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-[#0d2a46] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-white text-[#0d2a46] text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wide">
                    Delivery Address
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  {fetchedAddress.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowAllAddresses(!showAllAddresses)}
                      className="text-sky-200 hover:text-white transition"
                    >
                      {showAllAddresses ? "Close List" : "Change Address"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditshow(!editshow)}
                    className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded transition"
                  >
                    {editshow ? "Hide Form" : "+ Add New"}
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {selectedAddress ? (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-[#0d2a46] shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-slate-900">{selectedAddress.fullName}</p>
                      <p className="text-slate-600 mt-0.5">
                        {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} -{" "}
                        {selectedAddress.zip}, {selectedAddress.country}
                      </p>
                      <p className="mt-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <PhoneIcon className="w-3.5 h-3.5 text-[#0d2a46]" />
                        {selectedAddress.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg bg-slate-50 space-y-3">
                    <p className="text-sm text-slate-600 font-medium">
                      No delivery address added yet
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditshow(true)}
                      className="bg-[#0d2a46] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#163d61] transition"
                    >
                      Add Delivery Address
                    </button>
                  </div>
                )}

                {showAllAddresses && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {fetchedAddress.map((addr) => (
                      <button
                        key={addr._id}
                        type="button"
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAllAddresses(false);
                        }}
                        className={`text-left p-3.5 rounded-lg border transition ${
                          selectedAddress?._id === addr._id
                            ? "border-[#0d2a46] bg-sky-50/40 ring-1 ring-[#0d2a46]"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <p className="text-sm font-bold text-slate-900">{addr.fullName}</p>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                          {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">
                          {addr.phone}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {editshow && (
                  <form
                    onSubmit={handleSubmit}
                    className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                  >
                    <h3 className="sm:col-span-2 text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <PlusIcon className="w-4 h-4 text-[#0d2a46]" /> Add Shipping Address
                    </h3>

                    <div>
                      <label htmlFor="chk-fullName" className="block text-xs font-semibold text-slate-600 mb-1">
                        Full Name
                      </label>
                      <input
                        id="chk-fullName"
                        name="fullName"
                        placeholder="John Doe"
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm focus:border-[#0d2a46] outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="chk-phone" className="block text-xs font-semibold text-slate-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="chk-phone"
                        name="phone"
                        placeholder="+91 XXXXX XXXXX"
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm focus:border-[#0d2a46] outline-none"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="chk-street" className="block text-xs font-semibold text-slate-600 mb-1">
                        Street Address
                      </label>
                      <input
                        id="chk-street"
                        name="street"
                        placeholder="House No, Building, Street"
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm focus:border-[#0d2a46] outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="chk-city" className="block text-xs font-semibold text-slate-600 mb-1">
                        City
                      </label>
                      <input
                        id="chk-city"
                        name="city"
                        placeholder="City"
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm focus:border-[#0d2a46] outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="chk-state" className="block text-xs font-semibold text-slate-600 mb-1">
                        State
                      </label>
                      <input
                        id="chk-state"
                        name="state"
                        placeholder="State"
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm focus:border-[#0d2a46] outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="chk-zip" className="block text-xs font-semibold text-slate-600 mb-1">
                        Pincode
                      </label>
                      <input
                        id="chk-zip"
                        name="zip"
                        placeholder="600001"
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm focus:border-[#0d2a46] outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="chk-country" className="block text-xs font-semibold text-slate-600 mb-1">
                        Country
                      </label>
                      <input
                        id="chk-country"
                        name="country"
                        placeholder="India"
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm focus:border-[#0d2a46] outline-none"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-[#0d2a46] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#163d61] transition"
                      >
                        Save & Use Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditshow(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* 2. ORDER SUMMARY */}
            <section className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-[#0d2a46] text-white px-4 py-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-white text-[#0d2a46] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  Order Items ({validCart.length})
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {validCart.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Your cart is empty.{" "}
                    <Link to="/product" className="text-[#0d2a46] font-semibold hover:underline">
                      Browse fragrances
                    </Link>
                  </div>
                ) : (
                  validCart.map((item) => {
                    const { effectivePrice, size: displaySize } = getSizePricing(
                      item.product,
                      item.size
                    );
                    return (
                      <div
                        key={`${item.product._id}-${item.size || "default"}`}
                        className="p-4 flex gap-3.5 items-center"
                      >
                        <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-md p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={getProductImageUrl(item.product.images)}
                            onError={handleImageError}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {item.product.name}
                          </h3>
                          {(item.product.isActive === false ||
                            (item.product.stock ?? 0) < (item.quantity || 1)) && (
                            <p className="text-xs font-semibold text-rose-600 mt-0.5">
                              {item.product.isActive === false
                                ? "Unavailable — remove from cart"
                                : `Only ${item.product.stock ?? 0} in stock`}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 text-xs text-slate-500">
                            <span>
                              {displaySize ? `${displaySize} • ` : ""}Qty: {item.quantity}
                            </span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => removeitem(item.product._id, item.size)}
                                disabled={placingOrder}
                                aria-label={`Remove ${item.product.name} from order`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition disabled:opacity-50"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                                Remove
                              </button>
                              <span className="text-sm font-bold text-slate-900">
                                ₹{effectivePrice * (item.quantity || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: PAYMENT & PRICE SUMMARY */}
          <aside className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-4 sm:p-5 lg:sticky lg:top-20 space-y-5">
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                Price Details
              </h2>
              <div className="flex justify-between text-sm text-slate-700">
                <span>Subtotal</span>
                <span>₹{mrpTotal}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span>−₹{totalDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-700">
                <span>Delivery</span>
                <span className="font-semibold text-emerald-700">FREE</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Total Payable</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Payment Method
              </p>
              {[
                {
                  id: "COD",
                  label: "Cash on Delivery",
                  icon: <BanknotesIcon className="w-4 h-4 text-[#0d2a46]" />,
                },
                {
                  id: "UPI",
                  label: "Razorpay / UPI / Card",
                  icon: <CreditCardIcon className="w-4 h-4 text-[#0d2a46]" />,
                },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                    paymentMethod === method.id
                      ? "border-[#0d2a46] bg-sky-50/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {method.icon}
                    <span className="text-sm font-semibold text-slate-800">{method.label}</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-[#0d2a46] w-4 h-4"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={Paynow}
              disabled={!validCart.length || placingOrder || hasUnavailableItems}
              className="w-full bg-[#0d2a46] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#163d61] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placingOrder
                ? "Processing Order..."
                : hasUnavailableItems
                ? "Remove Unavailable Items in Cart"
                : paymentMethod === "UPI"
                ? `Pay ₹${totalPrice}`
                : `Confirm Order (₹${totalPrice})`}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
