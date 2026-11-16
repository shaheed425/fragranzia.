import toast from "react-hot-toast";

export const PENDING_PAYMENT_KEY = "pending_payment_order_id";

/**
 * Displays a luxury, seamless full-screen "Please wait..." overlay
 * eliminating any blank gap between Razorpay payment and order confirmation.
 */
export const showProcessingOverlay = (
  title = "Please wait...",
  subtitle = "Verifying your payment with bank & securing your fragrance order..."
) => {
  if (typeof document === "undefined") return;
  let overlay = document.getElementById("fragranzia-payment-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "fragranzia-payment-overlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(13, 42, 70, 0.88);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: fragranziaFadeIn 0.2s ease-out forwards;
    `;
    overlay.innerHTML = `
      <style>
        @keyframes fragranziaFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fragranziaSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
      <div style="background: #ffffff; color: #0f172a; border-radius: 20px; padding: 40px 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.2);">
        <div style="width: 60px; height: 60px; margin: 0 auto 20px; border-radius: 50%; border: 4px solid #e2e8f0; border-top-color: #0d2a46; animation: fragranziaSpin 0.8s linear infinite;"></div>
        <h3 id="fragranzia-overlay-title" style="margin: 0 0 10px; font-size: 20px; font-weight: 700; color: #0d2a46; letter-spacing: -0.3px;">${title}</h3>
        <p id="fragranzia-overlay-subtitle" style="margin: 0 0 20px; font-size: 13.5px; color: #475569; line-height: 1.55;">${subtitle}</p>
        <div style="display: inline-flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 9999px; font-size: 11.5px; font-weight: 600; color: #64748b;">
          🔒 Please do not refresh or press back
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    const titleEl = document.getElementById("fragranzia-overlay-title");
    const subEl = document.getElementById("fragranzia-overlay-subtitle");
    if (titleEl) titleEl.innerText = title;
    if (subEl) subEl.innerText = subtitle;
    overlay.style.display = "flex";
  }
};

export const hideProcessingOverlay = () => {
  if (typeof document === "undefined") return;
  const overlay = document.getElementById("fragranzia-payment-overlay");
  if (overlay) {
    overlay.remove();
  }
};

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
      showProcessingOverlay(
        "Payment Received! Please wait...",
        "Verifying your payment with bank & securing your fragrance order..."
      );
      try {
        const res = await verifyPaymentAPI({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (res?.paymentState === "CAPTURED") {
          localStorage.removeItem(PENDING_PAYMENT_KEY);
          if (fetchcartproduct) await fetchcartproduct();
          showProcessingOverlay(
            "Order Confirmed! Redirecting...",
            "Thank you! Preparing your invoice & order details..."
          );
        } else if (
          ["PENDING", "AUTHORIZED", "REQUIRES_REVIEW"].includes(res?.paymentState) ||
          res?.pending
        ) {
          showProcessingOverlay(
            "Finalizing Status...",
            "Payment received, checking confirmation details..."
          );
        } else {
          hideProcessingOverlay();
          toast.error(res?.message || "Payment verification failed.");
        }

        if (onComplete) onComplete(res);
        navigate(`/payment-status/${orderId}`, { state: { statusData: res } });
      } catch (err) {
        hideProcessingOverlay();
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
        hideProcessingOverlay();
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
    hideProcessingOverlay();
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

