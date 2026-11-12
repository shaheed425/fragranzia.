import { useCallback } from "react";
import axiosInstance from "../../Axios";
import useAxiosPrivate from "../../Hooks/useAxiosPrivate";

const useUserService = () => {
  const axiosPriv = useAxiosPrivate();

  const addAddressAPI = useCallback(async (data) => {
    const response = await axiosPriv.post("/api/addaddress", data);
    return response;
  }, [axiosPriv]);

  const getAddressesAPI = useCallback(async () => {
    const response = await axiosPriv.get("/api/address");
    return response;
  }, [axiosPriv]);

  const addcartt = useCallback(async (_id, size) => {
    const payload = typeof size === "string" ? { size } : {};
    const response = await axiosPriv.put(`/api/cart/${_id}`, payload);
    return response;
  }, [axiosPriv]);

  const fetchcart = useCallback(async () => {
    const response = await axiosPriv.get("/api/cart/fetch");
    return response.data;
  }, [axiosPriv]);

  const deletecart = useCallback(async (_id, size) => {
    const config = typeof size === "string" ? { params: { size } } : undefined;
    const response = await axiosPriv.delete(`/api/cart/delete/${_id}`, config);
    return response.data;
  }, [axiosPriv]);

  const increaseqty = useCallback(async (productId, size) => {
    const payload = typeof size === "string" ? { size } : {};
    const response = await axiosPriv.put(`/api/cart/increase/${productId}`, payload);
    return response.data;
  }, [axiosPriv]);

  const decreseqty = useCallback(async (productId, size) => {
    const payload = typeof size === "string" ? { size } : {};
    const response = await axiosPriv.put(`/api/cart/decrease/${productId}`, payload);
    return response.data;
  }, [axiosPriv]);

  const addwishlist = useCallback(async (_id) => {
    const response = await axiosPriv.put(`/api/wishlist/${_id}`);
    return response.data;
  }, [axiosPriv]);

  const getWishlist = useCallback(async () => {
    const response = await axiosPriv.get("/api/wishlist");
    return response.data;
  }, [axiosPriv]);

  const editAddressAPI = useCallback(async (id, data) => {
    const response = await axiosPriv.put(`/api/address/${id}`, data);
    return response;
  }, [axiosPriv]);

  const deleteAddressAPI = useCallback(async (id) => {
    const response = await axiosPriv.delete(`/api/address/${id}`);
    return response;
  }, [axiosPriv]);

  const setDefaultAddressAPI = useCallback(async (id) => {
    const response = await axiosPriv.put(`/api/address/default/${id}`);
    return response;
  }, [axiosPriv]);

  const ordering = useCallback(async (orderData) => {
    const response = await axiosPriv.post("/api/order", orderData);
    return response.data;
  }, [axiosPriv]);

  const fetchorders = useCallback(async () => {
    const response = await axiosPriv.get("/api/user-orders");
    return response.data;
  }, [axiosPriv]);

  const cancelOrder = useCallback(async (id) => {
    const response = await axiosPriv.put(`/api/order/cancel/${id}`);
    return response.data;
  }, [axiosPriv]);

  const registerAPI = useCallback(async (data) => {
    const response = await axiosInstance.post("/api/user/register", data);
    return response;
  }, []);

  const verifyEmailAPI = useCallback(async (data) => {
    const response = await axiosInstance.post("/api/user/verify-email", data);
    return response.data;
  }, []);

  const resendVerificationAPI = useCallback(async (data) => {
    const response = await axiosInstance.post("/api/user/resend-verification", data);
    return response.data;
  }, []);

  const loginAPI = useCallback(async (data) => {
    const response = await axiosInstance.post("/api/user/login", data);
    return response.data;
  }, []);

  const getProductsAPI = useCallback(async (search = "", sort = "", category = "") => {
    const params = {};
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (category) params.category = category;
    const response = await axiosInstance.get("/api/product", { params });
    return response.data;
  }, []);

  const getSingleProductAPI = useCallback(async (id) => {
    const response = await axiosInstance.get(`/api/product/${id}`);
    return response.data;
  }, []);

  const verifyPaymentAPI = useCallback(async (data) => {
    const response = await axiosPriv.post("/api/payment/verify-payment", data);
    return response.data;
  }, [axiosPriv]);

  const getPaymentStatusAPI = useCallback(async (orderId) => {
    const response = await axiosPriv.get(`/api/payment/status/${orderId}`);
    return response.data;
  }, [axiosPriv]);

  const reportClientFailureAPI = useCallback(async (data) => {
    const response = await axiosPriv.post("/api/payment/client-failure", data);
    return response.data;
  }, [axiosPriv]);

  const retryPaymentAPI = useCallback(async (orderId) => {
    const response = await axiosPriv.post(`/api/payment/retry/${orderId}`);
    return response.data;
  }, [axiosPriv]);

  const returnOrder = useCallback(async (id, reason) => {
    const response = await axiosPriv.put(`/api/order/return/${id}`, { reason });
    return response.data;
  }, [axiosPriv]);

  return {
    registerAPI,
    verifyEmailAPI,
    resendVerificationAPI,
    loginAPI,
    getProductsAPI,
    getSingleProductAPI,
    verifyPaymentAPI,
    getPaymentStatusAPI,
    reportClientFailureAPI,
    retryPaymentAPI,
    addAddressAPI,
    getAddressesAPI,
    editAddressAPI,
    deleteAddressAPI,
    addcartt,
    deletecart,
    fetchcart,
    addwishlist,
    getWishlist,
    increaseqty,
    decreseqty,
    fetchorders,
    ordering,
    cancelOrder,
    returnOrder,
    setDefaultAddressAPI
  };
};

export default useUserService;
