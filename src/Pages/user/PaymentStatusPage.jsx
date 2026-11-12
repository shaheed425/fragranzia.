import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Mail,
  MessageCircle,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import useUserService from "../../service/user-api-service/UserService";
import { Cartcontext } from "../../Contexts/contexts";
import {
  launchRazorpayCheckout,
  PENDING_PAYMENT_KEY,
} from "../../utils/razorpayCheckout";

const POLL_INTERVAL_MS = 5000;
const MAX_AUTO_POLLS = 12;

export default function PaymentStatusPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchcartproduct } = useContext(Cartcontext);
  const {
    getPaymentStatusAPI,
    verifyPaymentAPI,
    reportClientFailureAPI,
    retryPaymentAPI,
  } = useUserService();

  const initialData = location.state?.statusData || null;
  const [statusData, setStatusData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [networkUnknown, setNetworkUnknown] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const checkStatus = useCallback(
    async ({ silent = false } = {}) => {
      if (!orderId) return null;
      try {
        if (!silent) setRefreshing(true);
        const res = await getPaymentStatusAPI(orderId);
        setStatusData(res);
        setNetworkUnknown(Boolean(res?.unknown));

        if (["CAPTURED", "REFUNDED"].includes(res?.paymentState)) {
          localStorage.removeItem(PENDING_PAYMENT_KEY);
          if (fetchcartproduct) await fetchcartproduct();
        }
        return res;
      } catch {
        setNetworkUnknown(true);
        return null;
      } finally {
        setLoading(false);
        if (!silent) setRefreshing(false);
      }
    },
    [orderId, getPaymentStatusAPI, fetchcartproduct]
  );

  useEffect(() => {
    checkStatus({ silent: Boolean(initialData) });
  }, [checkStatus, initialData]);

  const paymentState = networkUnknown
    ? "PENDING"
    : statusData?.paymentState || "PENDING";
  const order = statusData?.order;
  const isPending = ["CREATED", "PENDING", "AUTHORIZED", "REFUND_PENDING"].includes(
    paymentState
  );

  useEffect(() => {
    if (!isPending || pollCount >= MAX_AUTO_POLLS) return;
    const timer = setTimeout(() => {
      setPollCount((c) => c + 1);
      checkStatus({ silent: true });
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [isPending, pollCount, checkStatus]);

  const handleSafeRetry = async () => {
    if (!orderId || retrying) return;
    try {
      setRetrying(true);
      const res = await retryPaymentAPI(orderId);

      if (res?.alreadyPaid) {
        localStorage.removeItem(PENDING_PAYMENT_KEY);
        if (fetchcartproduct) await fetchcartproduct();
        toast.success("Payment was already verified!");
        await checkStatus({ silent: true });
        return;
      }

      if (["PENDING", "AUTHORIZED", "REQUIRES_REVIEW"].includes(res?.paymentState)) {
        toast("Payment verification pending. Please wait.");
        await checkStatus({ silent: true });
        return;
      }

      if (res?.success && res?.razorpayOrder) {
        await launchRazorpayCheckout({
          razorpayOrder: res.razorpayOrder,
          orderRecord: res.order || order,
          verifyPaymentAPI,
          reportClientFailureAPI,
          fetchcartproduct,
          navigate,
          onComplete: (nextRes) => {
            if (nextRes) setStatusData(nextRes);
          },
        });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Payment verification pending — unable to start retry right now.";
      toast.error(msg);
      await checkStatus({ silent: true });
    } finally {
      setRetrying(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-3">
          <RefreshCw className="w-7 h-7 text-[#0d2a46] animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-900">
            Payment verification in progress
          </p>
          <p className="text-xs text-slate-500">
            Checking verified payment status with Razorpay...
          </p>
        </div>
      </div>
    );
  }

  const displayOrderId =
    order?.orderNumber ||
    (order?._id
      ? `#${order._id.slice(-8).toUpperCase()}`
      : `#${String(orderId || "").slice(-8).toUpperCase()}`);

  const address = order?.shippingAddress;

  const supportPhone = import.meta.env.VITE_WHATSAPP_NUMBER || "918590315711";
  const cleanSupportPhone = String(supportPhone).replace(/\D/g, "");
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const confirmedOrderId = order?._id || orderId;
  const invoicePdfUrl = confirmedOrderId
    ? `${backendUrl}/api/order/invoice/${confirmedOrderId}`
    : null;

  const itemsText = (order?.orderItems || [])
    .map((item) => {
      const pName = item.product?.title || item.product?.name || item.name || "Perfume";
      const pSize = item.size ? ` (${item.size})` : "";
      const pQty = item.quantity || 1;
      const pPrice = item.price ? ` — ₹${item.price * pQty}` : "";
      return `• ${pName}${pSize} x${pQty}${pPrice}`;
    })
    .join("\n");

  const whatsappCapturedMsg = [
    `✨ *Online Payment Confirmed — Fragranzia*`,
    `Hi Fragranzia, I placed order *${displayOrderId}* for *₹${order?.totalAmount ?? 0}* (Paid via UPI).`,
    address?.fullName ? `Customer: ${address.fullName}` : null,
    address?.phone ? `Phone: ${address.phone}` : null,
    itemsText ? `\n*Products:*\n${itemsText}` : null,
    invoicePdfUrl ? `\n📄 *Official PDF Invoice:*\n${invoicePdfUrl}` : null,
    `\nPlease confirm dispatch and share tracking updates. Thank you!`,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappCapturedLink = `https://wa.me/${cleanSupportPhone}?text=${encodeURIComponent(
    whatsappCapturedMsg
  )}`;
  const whatsappReviewMsg = `Hi Fragranzia, my payment for order ${displayOrderId} requires review. Can you please check?`;
  const whatsappReviewLink = `https://wa.me/${cleanSupportPhone}?text=${encodeURIComponent(
    whatsappReviewMsg
  )}`;

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 py-6 sm:py-10 px-3 sm:px-6">
      <main className="max-w-3xl mx-auto space-y-4">
        {paymentState === "CAPTURED" ? (
          <section className="bg-white rounded-xl border border-emerald-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Payment Verified &amp; Confirmed
                </p>
                <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                  Thank you for shopping with Fragranzia
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Your payment has been captured and your order is confirmed for dispatch.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <p className="font-semibold uppercase text-slate-500">Order Number</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                  {displayOrderId}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <p className="font-semibold uppercase text-slate-500">Amount Paid</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  ₹{order?.totalAmount ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <p className="font-semibold uppercase text-slate-500">Payment Ref</p>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-800 truncate">
                  {order?.transaction_reference || order?.razorpay_payment_id || "Verified"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={whatsappCapturedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] px-5 py-2.5 text-sm font-bold text-white transition shadow-xs"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                Chat on WhatsApp
              </a>
              {invoicePdfUrl && (
                <a
                  href={invoicePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                >
                  <FileText className="h-4 w-4 text-[#0d2a46]" />
                  Download Invoice (PDF)
                </a>
              )}
              <Link
                to="/orderdetails"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0d2a46] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#163d61] transition"
              >
                <ReceiptText className="h-4 w-4" />
                View Order
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ) : paymentState === "REQUIRES_REVIEW" ? (
          <section className="bg-white rounded-xl border border-amber-300 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Requires Review
                </p>
                <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                  Payment Confirmation Delayed
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Confirmation for order{" "}
                  <span className="font-mono font-bold text-slate-900">
                    {displayOrderId}
                  </span>{" "}
                  requires verification by our payments team before completion.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 font-medium">
              Please <strong>do not attempt another payment</strong> for this order until
              verification is complete. Any duplicate debit will be refunded automatically
              after review.
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => checkStatus()}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0d2a46] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#163d61] transition disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Checking..." : "Check Status"}
              </button>
              <a
                href={whatsappReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] px-5 py-2.5 text-sm font-bold text-white transition shadow-xs"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                WhatsApp Support
              </a>
              <a
                href={`mailto:support@fragranzia.com?subject=Payment%20Review%20${encodeURIComponent(
                  displayOrderId
                )}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </a>
              <Link
                to="/orderdetails"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                View My Orders
              </Link>
            </div>
          </section>
        ) : paymentState === "REFUNDED" || paymentState === "REFUND_PENDING" ? (
          <section className="bg-white rounded-xl border border-indigo-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  {paymentState}
                </p>
                <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                  {paymentState === "REFUNDED"
                    ? `Payment Refunded for Order ${displayOrderId}`
                    : `Refund In Progress for Order ${displayOrderId}`}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {paymentState === "REFUNDED"
                    ? `Your refund of ₹${order?.totalAmount ?? 0} has been processed and reflects within 5–7 business days.`
                    : `Your refund of ₹${order?.totalAmount ?? 0} is currently being processed by the payment gateway.`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/orderdetails"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0d2a46] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#163d61] transition"
              >
                View Orders
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Back to Store
              </Link>
            </div>
          </section>
        ) : paymentState === "FAILED" ? (
          <section className="bg-white rounded-xl border border-rose-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Payment Failed
                </p>
                <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                  We could not complete your payment
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {order?.paymentFailureReason ||
                    statusData?.message ||
                    "Your bank or UPI app declined this transaction. If any amount was debited, it is automatically reversed."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {statusData?.canRetry && (
                <button
                  type="button"
                  onClick={handleSafeRetry}
                  disabled={retrying}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0d2a46] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#163d61] transition disabled:opacity-60"
                >
                  <RotateCcw className="h-4 w-4" />
                  {retrying ? "Checking previous attempt..." : "Retry Payment"}
                </button>
              )}
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <ShoppingCart className="h-4 w-4" />
                Return to Cart
              </Link>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-xl border border-amber-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  {paymentState}
                </p>
                <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                  {networkUnknown
                    ? "Payment verification pending"
                    : "Payment verification in progress"}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {paymentState === "AUTHORIZED"
                    ? `Your payment for order ${displayOrderId} is authorized and waiting for bank capture settlement.`
                    : `We are waiting for final payment confirmation from Razorpay for order ${displayOrderId}. Status refreshes automatically — please do not pay twice.`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => checkStatus()}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0d2a46] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#163d61] transition disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Checking..." : "Check Status"}
              </button>

              {statusData?.canRetry && paymentState === "CREATED" && (
                <button
                  type="button"
                  onClick={handleSafeRetry}
                  disabled={retrying}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#0d2a46] bg-white px-5 py-2.5 text-sm font-bold text-[#0d2a46] hover:bg-slate-50 transition disabled:opacity-60"
                >
                  <RotateCcw className="h-4 w-4" />
                  {retrying ? "Preparing..." : "Complete Payment"}
                </button>
              )}

              <Link
                to="/orderdetails"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <ReceiptText className="h-4 w-4" />
                My Orders
              </Link>
            </div>
          </section>
        )}

        {address && (
          <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Home className="h-4 w-4 text-[#0d2a46]" />
              Delivery Address
            </div>
            <p className="font-semibold text-slate-900">{address.fullName}</p>
            <p className="text-slate-600">
              {address.street}, {address.city}, {address.state} - {address.zip}
            </p>
            {address.phone && <p className="text-slate-700 font-medium">{address.phone}</p>}
          </section>
        )}
      </main>
    </div>
  );
}
