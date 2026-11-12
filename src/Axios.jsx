import axios from "axios";

const rawApiUrl =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "");

export const BASE_URL = rawApiUrl.replace(/\/+$/, "");
export const IMAGE_URL = `${BASE_URL}/uploads`;
export const MEDIA_URL = "";
export const PLACEHOLDER_IMAGE = "/perfume-placeholder.svg";

export const getProductImageUrl = (images, index = 0) => {
  const filename = Array.isArray(images) ? images[index] : images;
  return filename ? `${IMAGE_URL}/${filename}` : PLACEHOLDER_IMAGE;
};

export const handleImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER_IMAGE;
};

const parseMl = (sizeStr) => {
  if (typeof sizeStr !== "string") return null;
  const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const num = Number(match[1]);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const roundScaledAmount = (value) => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value >= 100 ? Math.round(value / 10) * 10 : Math.max(1, Math.round(value));
};

/**
 * Compute size-adjusted MRP, sale price, effective unit price, and discount %
 * relative to product.sizes[0] so storefront card base prices stay consistent.
 */
export const getSizePricing = (product, size) => {
  if (!product) {
    return { price: 0, saleprice: 0, effectivePrice: 0, discountPercent: 0, size: "" };
  }

  const basePrice = Number(product.price) || 0;
  const rawSale = Number(product.saleprice) || 0;
  const hasBaseDiscount = rawSale > 0 && rawSale < basePrice;

  const baseSize = Array.isArray(product.sizes) && product.sizes.length > 0 ? String(product.sizes[0]) : "";
  const activeSize = typeof size === "string" && size.trim() ? size.trim() : baseSize;

  const baseMl = parseMl(baseSize);
  const targetMl = parseMl(activeSize);

  let price = basePrice;
  let saleprice = hasBaseDiscount ? rawSale : 0;

  if (baseMl && targetMl && activeSize !== baseSize) {
    const factor = Math.pow(targetMl / baseMl, 0.8);
    price = roundScaledAmount(basePrice * factor);
    if (hasBaseDiscount) {
      const scaledSale = roundScaledAmount(rawSale * factor);
      saleprice = scaledSale >= price ? Math.max(1, price - 1) : scaledSale;
    }
  }

  const hasDiscount = saleprice > 0 && saleprice < price;
  const effectivePrice = hasDiscount ? saleprice : price;
  const discountPercent =
    hasDiscount && price > 0 ? Math.round(((price - saleprice) / price) * 100) : 0;

  return { price, saleprice, effectivePrice, discountPercent, size: activeSize };
};

export const getEffectivePrice = (product, size) => getSizePricing(product, size).effectivePrice;

export const getDiscountPercent = (product, size) => getSizePricing(product, size).discountPercent;

export const AUTH_STORAGE_KEYS = ["token", "role", "name", "email"];

export const clearStoredAuth = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const isTokenValid = (token) => {
  if (!token || token === "undefined" || token === "null") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (typeof payload?.exp === "number" && payload.exp * 1000 <= Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
});

// Attach auth & content-type headers at module init so child useEffects never race ahead of AuthProvider
axiosPrivate.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    const activeToken = localStorage.getItem("token");
    if (isTokenValid(activeToken) && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${activeToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
