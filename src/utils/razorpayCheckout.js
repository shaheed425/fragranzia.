import toast from "react-hot-toast";

export const PENDING_PAYMENT_KEY = "pending_payment_order_id";

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Opens Razorpay Checkout and routes every outcome (success, pending verification,
 * failure, dismissal, or network timeout) through server-verified recovery.
 */
export const launchRazorpayCheckout = async ({
  razorpayOrder,
  orderRecord,
  verifyPaymentAPI,
  reportClientFailureAPI,
  fetchcartproduct,
  navigate,
  prefill = {},
  onComplete,
}) => {
  const orderId = orderRecord?._id;
  if (!razorpayOrder?.id || !orderId) {
    toast.error("Unable to start payment session.");
    return;
  }

  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded) {
    toast.error("Failed to load Razorpay SDK. Redirecting to payment recovery...");
    localStorage.setItem(PENDING_PAYMENT_KEY, orderId);
    navigate(`/payment-status/${orderId}`);
    return;
  }

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!razorpayKey) {
    toast.error("Payment gateway is not configured.");
    return;
  }

  localStorage.setItem(PENDING_PAYMENT_KEY, orderId);
  let handled = false;

  const options = {
    key: razorpayKey,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency || "INR",
    name: "Fragranzia",
    description: "Perfume Purchase",
    order_id: razorpayOrder.id,
    prefill,
    handler: async (response) => {
      handled = true;
      try {
        const res = await verifyPaymentAPI({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (res?.paymentState === "CAPTURED") {
          localStorage.removeItem(PENDING_PAYMENT_KEY);
          if (fetchcartproduct) await fetchcartproduct();
          toast.success("Payment verified and captured! Order confirmed.");
        } else if (
          ["PENDING", "AUTHORIZED", "REQUIRES_REVIEW"].includes(res?.paymentState) ||
          res?.pending
        ) {
          toast("Payment verification pending. Checking final status...");
        } else {
          toast.error(res?.message || "Payment verification failed.");
        }

        if (onComplete) onComplete(res);
        navigate(`/payment-status/${orderId}`, { state: { statusData: res } });
      } catch (err) {
        // Network timeout / backend downtime after Razorpay payment must NEVER assume FAILED
        const status = err?.response?.status;
        if (!status || status >= 500 || err.code === "ECONNABORTED") {
          toast("Payment verification pending — server unreachable.");
        } else {
          toast.error(err.response?.data?.message || "Payment verification pending.");
        }
        if (onComplete) onComplete(null);
        navigate(`/payment-status/${orderId}`);
      }
    },
    modal: {
      ondismiss: () => {
        if (handled) return;
        handled = true;
        toast("Checkout paused. Checking payment status...");
        if (onComplete) onComplete(null);
        navigate(`/payment-status/${orderId}`);
      },
    },
    theme: { color: "#0d2a46" },
  };

  const rzp1 = new window.Razorpay(options);
  rzp1.on("payment.failed", async (failResp) => {
    if (handled) return;
    handled = true;
    try {
      const res = await reportClientFailureAPI({
        orderId,
        razorpay_payment_id: failResp?.error?.metadata?.payment_id || null,
        reason: failResp?.error?.description || failResp?.error?.reason || "Payment failed",
      });
      if (res?.paymentState === "CAPTURED") {
        localStorage.removeItem(PENDING_PAYMENT_KEY);
        if (fetchcartproduct) await fetchcartproduct();
      }
      if (onComplete) onComplete(res);
    } catch {
      // Backend down -> status page will poll and display "Payment verification pending"
    }
    navigate(`/payment-status/${orderId}`);
  });

  rzp1.open();
};

