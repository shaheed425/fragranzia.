import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Usersidebar from "../../Components/Usersidebar";
import useUserService from "../../service/user-api-service/UserService";
import {
  ChevronRight,
  MapPin,
  Package2,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { getEffectivePrice, getProductImageUrl, handleImageError } from "../../Axios";

const RETURN_REASONS = [
  "Damaged or Leaking Perfume Bottle",
  "Broken Spray Nozzle / Defective Atomizer",
  "Wrong Perfume or Bottle Size (ml) Received",
  "Missing Item or Broken Security Seal",
  "Scent / Quality Not as Expected",
  "Ordered by Mistake",
  "Other",
];

const Orderdetails = () => {
  const [orderdata, setOrderdata] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDetails, setReturnDetails] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const { fetchorders, cancelOrder, returnOrder } = useUserService();

  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetchorders();
      const updated = res?.data || [];
      setOrderdata(updated);
      setSelectedOrder((prev) =>
        prev ? updated.find((o) => o._id === prev._id) || null : null
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [fetchorders]);

  useEffect(() => {
    let active = true;
    fetchorders()
      .then((res) => {
        if (active) setOrderdata(res?.data || []);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
    return () => {
      active = false;
    };
  }, [fetchorders]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showReturnModal) {
          setShowReturnModal(false);
        } else if (selectedOrder) {
          setSelectedOrder(null);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedOrder, showReturnModal]);

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(id);
        await refreshOrders();
        toast.success("Order cancelled successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to cancel order");
      }
    }
  };

  const handleReturnClick = (id) => {
    setSelectedOrderId(id);
    setReturnReason("");
    setReturnDetails("");
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async () => {
    if (!returnReason) {
      toast.error("Please select a reason for return");
      return;
    }

    const trimmedDetails = returnDetails.trim();
    if (returnReason === "Other" && !trimmedDetails) {
      toast.error("Please describe your return reason");
      return;
    }

    const finalReason =
      returnReason === "Other"
        ? `Other: ${trimmedDetails}`
        : trimmedDetails
        ? `${returnReason} — ${trimmedDetails}`
        : returnReason;

    if (submittingReturn) return;
    try {
      setSubmittingReturn(true);
      await returnOrder(selectedOrderId, finalReason);
      setShowReturnModal(false);
      setReturnReason("");
      setReturnDetails("");
      await refreshOrders();
      toast.success("Return request submitted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit return request");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const statusStyles = (status) => {
    if (status === "Delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "Cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
    if (status === "Returned") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const shippingAddress = selectedOrder?.shippingAddress || selectedOrder?.address;

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col bg-[#f1f3f6] text-slate-900">
      <div className="flex-1 max-w-7xl w-full mx-auto px-0 sm:px-6 py-0 sm:py-6 flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
        <Usersidebar activeTab="orders" />

        <main className="flex-1 w-full px-3 sm:px-0 py-4 sm:py-0 space-y-4 min-w-0">
          <div className="bg-white rounded-lg border border-slate-200 px-4 sm:px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                My Orders ({orderdata.length})
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any order card to view full item details, track status, or manage returns.
              </p>
            </div>
            <Link
              to="/product"
              className="text-xs font-semibold text-[#0d2a46] hover:underline"
            >
              Shop More →
            </Link>
          </div>

          {orderdata && orderdata.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {orderdata.map((order) => {
                const firstItem = order.orderItems?.[0];
                const extraCount = (order.orderItems?.length || 0) - 1;
                const totalQty =
                  order.orderItems?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;

                return (
                  <button
                    key={order._id}
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left bg-white rounded-lg border border-slate-200 p-4 hover:border-[#0d2a46] hover:shadow-md transition flex flex-col justify-between gap-3 cursor-pointer group"
                  >
                    {/* Card Top: Order ID + Status */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div>
                        <p className="font-mono text-xs font-bold text-[#0d2a46]">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Placed {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${statusStyles(
                          order.deliveryStatus
                        )}`}
                      >
                        {order.deliveryStatus}
                      </span>
                    </div>

                    {/* Card Middle: Thumbnail + Primary Product */}
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-md p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={getProductImageUrl(firstItem?.product?.images)}
                          onError={handleImageError}
                          alt={firstItem?.product?.name || "Ordered fragrance"}
                          className="max-h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#0d2a46]">
                          {firstItem?.product?.name || "Fragrance Order"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {totalQty} {totalQty === 1 ? "item" : "items"}
                          {extraCount > 0 ? ` (+${extraCount} more)` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Card Bottom: Total & Open Hint */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between w-full text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          ₹{order.totalAmount ?? 0}
                        </span>
                        <span className="text-[11px] font-medium uppercase text-slate-500">
                          • {order.paymentMethod === "UPI" ? order.paymentState || order.paymentStatus : order.paymentStatus}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 font-semibold text-[#0d2a46] group-hover:translate-x-0.5 transition-transform">
                        Details <ChevronRight size={14} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 py-14 px-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Package2 size={24} />
              </div>
              <h2 className="text-base font-bold text-slate-900">No Orders Yet</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore our fragrance collection and place your first order.
              </p>
              <Link
                to="/product"
                className="inline-block bg-[#0d2a46] text-white px-5 py-2 rounded-md text-xs font-semibold hover:bg-[#163d61] transition"
              >
                Browse Fragrances
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* ORDER DETAILS MODAL (on single card click) */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-detail-title"
        >
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setSelectedOrder(null)}
            aria-hidden="true"
          />

          <div className="relative bg-white w-full max-w-xl max-h-[90vh] flex flex-col rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 id="order-detail-title" className="text-base font-bold text-slate-900">
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyles(
                      selectedOrder.deliveryStatus
                    )}`}
                  >
                    {selectedOrder.deliveryStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Items */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Items Ordered ({selectedOrder.orderItems?.length || 0})
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {selectedOrder.orderItems?.map((item, idx) => {
                    const unitPrice =
                      item.price ?? getEffectivePrice(item.product, item.size);
                    return (
                      <div key={idx} className="p-3 flex items-center gap-3 bg-white">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-md p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={getProductImageUrl(item.product?.images)}
                            onError={handleImageError}
                            alt={item.product?.name || "Product"}
                            className="max-h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          {item.product?._id ? (
                            <Link
                              to={`/single/${item.product._id}`}
                              onClick={() => setSelectedOrder(null)}
                              className="text-sm font-semibold text-slate-900 hover:text-[#0d2a46] hover:underline truncate block"
                            >
                              {item.product.name}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              Product unavailable
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.size ? `${item.size} • ` : ""}
                            Qty: {item.quantity} × ₹{unitPrice}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-slate-900 shrink-0">
                          ₹{unitPrice * (item.quantity || 1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Delivery Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1 text-xs">
                  <p className="font-bold uppercase tracking-wider text-slate-500">
                    Payment Summary
                  </p>
                  <p className="text-slate-700 pt-1">
                    Method:{" "}
                    <span className="font-semibold text-slate-900">
                      {selectedOrder.paymentMethod || "COD"}
                    </span>
                  </p>
                  <p className="text-slate-700">
                    Status:{" "}
                    <span className="font-semibold uppercase text-slate-900">
                      {selectedOrder.paymentMethod === "UPI"
                        ? selectedOrder.paymentState || selectedOrder.paymentStatus
                        : selectedOrder.paymentStatus}
                    </span>
                  </p>
                  {(selectedOrder.transaction_reference || selectedOrder.razorpay_payment_id) && (
                    <p className="text-slate-600 font-mono text-[11px] truncate">
                      Ref: {selectedOrder.transaction_reference || selectedOrder.razorpay_payment_id}
                    </p>
                  )}
                  <p className="text-sm font-bold text-slate-900 pt-1">
                    Total: ₹{selectedOrder.totalAmount ?? 0}
                  </p>
                </div>

                {shippingAddress && (
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1 text-xs">
                    <p className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <MapPin size={12} /> Delivery Address
                    </p>
                    <p className="font-semibold text-slate-900 pt-1">
                      {shippingAddress.fullName}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} -{" "}
                      {shippingAddress.zip}
                    </p>
                    {shippingAddress.phone && (
                      <p className="text-slate-700 font-medium">{shippingAddress.phone}</p>
                    )}
                  </div>
                )}
              </div>

              {selectedOrder.isReturned && selectedOrder.returnReason && (
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-medium">
                  Return requested — Reason: <span className="font-bold">{selectedOrder.returnReason}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {selectedOrder.paymentMethod === "UPI" &&
                  !["CAPTURED", "SUCCESS", "REFUNDED"].includes(selectedOrder.paymentState) &&
                  selectedOrder.deliveryStatus !== "Cancelled" && (
                    <Link
                      to={`/payment-status/${selectedOrder._id}`}
                      onClick={() => setSelectedOrder(null)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-800 border border-amber-300 rounded-md text-xs font-semibold hover:bg-amber-100 transition"
                    >
                      Verify / Retry Payment
                    </Link>
                  )}
                {(selectedOrder.deliveryStatus === "Pending" ||
                  selectedOrder.deliveryStatus === "Confirmed") && (
                  <button
                    type="button"
                    onClick={() => handleCancel(selectedOrder._id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-xs font-semibold hover:bg-rose-100 transition"
                  >
                    <XCircle size={14} /> Cancel Order
                  </button>
                )}
                {selectedOrder.deliveryStatus === "Delivered" && !selectedOrder.isReturned && (
                  <button
                    type="button"
                    onClick={() => handleReturnClick(selectedOrder._id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#0d2a46] border border-slate-300 rounded-md text-xs font-semibold hover:bg-slate-100 transition"
                  >
                    <RotateCcw size={14} /> Return Order
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#0d2a46] text-white rounded-md text-xs font-semibold hover:bg-[#163d61] transition ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN REASON MODAL */}
      {showReturnModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setShowReturnModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white w-full max-w-md max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-[#0d2a46] rounded-lg">
                <RotateCcw size={18} />
              </div>
              <div>
                <h2 id="return-modal-title" className="text-base font-bold text-slate-900">
                  Return Order
                </h2>
                <p className="text-xs text-slate-500">
                  Select a reason for your return request
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-0.5">
              {RETURN_REASONS.map((reason) => {
                const isSelected = returnReason === reason;
                return (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
                      isSelected
                        ? "bg-[#0d2a46] text-white border-[#0d2a46]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="return-reason"
                      value={reason}
                      checked={isSelected}
                      onChange={() => setReturnReason(reason)}
                      className="accent-[#0d2a46]"
                    />
                    <span>{reason}</span>
                  </label>
                );
              })}

              {returnReason && (
                <div className="pt-1">
                  <label
                    htmlFor="return-details"
                    className="block text-[11px] font-semibold text-slate-600 mb-1"
                  >
                    {returnReason === "Other"
                      ? "Please write your reason *"
                      : "Additional details (optional)"}
                  </label>
                  <textarea
                    id="return-details"
                    rows={3}
                    maxLength={400}
                    value={returnDetails}
                    onChange={(e) => setReturnDetails(e.target.value)}
                    placeholder={
                      returnReason === "Other"
                        ? "Describe the issue with the product..."
                        : "Add any extra details about packaging, scent, or size..."
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#0d2a46] outline-none resize-none"
                    required={returnReason === "Other"}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                disabled={submittingReturn}
                className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnSubmit}
                disabled={submittingReturn}
                className="px-4 py-2 bg-[#0d2a46] text-white rounded-lg text-xs font-bold hover:bg-[#163d61] transition disabled:opacity-60"
              >
                {submittingReturn ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orderdetails;
