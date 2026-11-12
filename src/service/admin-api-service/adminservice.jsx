import { useCallback } from "react";
import useAxiosPrivate from "../../Hooks/useAxiosPrivate";

const useAdminService = () => {
  const axiosPrivate = useAxiosPrivate();

  // ======================================== Product management ========================================

  const getProductData = useCallback(async () => {
    const response = await axiosPrivate.get("/api/product", {
      params: { includeInactive: true },
    });
    return response.data;
  }, [axiosPrivate]);

  const postProductData = useCallback(async (data) => {
    const response = await axiosPrivate.post("/api/product", data);
    return response.data;
  }, [axiosPrivate]);

  const putProductData = useCallback(async (ProductId, data) => {
    const response = await axiosPrivate.put(`/api/product/${ProductId}`, data);
    return response.data;
  }, [axiosPrivate]);

  const deleteProductData = useCallback(async (ProductId) => {
    const response = await axiosPrivate.delete(`/api/product/${ProductId}`);
    return response.data;
  }, [axiosPrivate]);

  const postCategoryData = useCallback(async (data) => {
    const response = await axiosPrivate.post("/api/category", data);
    return response.data;
  }, [axiosPrivate]);

  const getCategoryData = useCallback(async () => {
    const response = await axiosPrivate.get("/api/category");
    return response.data;
  }, [axiosPrivate]);

  const deleteCategoryData = useCallback(async (categoryId) => {
    const response = await axiosPrivate.delete(`/api/category/${categoryId}`);
    return response.data;
  }, [axiosPrivate]);

  const putCategoryData = useCallback(async (categoryId, data) => {
    const response = await axiosPrivate.put(`/api/category/${categoryId}`, data);
    return response.data;
  }, [axiosPrivate]);

  const getUsersData = useCallback(async () => {
    const response = await axiosPrivate.get("/api/user");
    return response.data;
  }, [axiosPrivate]);

  const login = useCallback(async (data) => {
    const response = await axiosPrivate.post("/api/user/login", data);
    return response.data;
  }, [axiosPrivate]);

  const getallorders = useCallback(async () => {
    const response = await axiosPrivate.get("/api/all-orders");
    return response.data;
  }, [axiosPrivate]);

  const updateOrderStatusAPI = useCallback(async (id, status) => {
    const response = await axiosPrivate.patch(`/api/update-status/${id}`, { status });
    return response.data;
  }, [axiosPrivate]);

  const verifyOrderPaymentAdminAPI = useCallback(async (orderId) => {
    const response = await axiosPrivate.post(`/api/payment/admin/verify/${orderId}`);
    return response.data;
  }, [axiosPrivate]);

  const getOrderTransactionsAdminAPI = useCallback(async (orderId) => {
    const response = await axiosPrivate.get(`/api/payments/admin/transactions/${orderId}`);
    return response.data;
  }, [axiosPrivate]);

  const getPaymentOverviewAdminAPI = useCallback(async (state = "ALL") => {
    const response = await axiosPrivate.get("/api/payments/admin/overview", {
      params: state && state !== "ALL" ? { state } : undefined,
    });
    return response.data;
  }, [axiosPrivate]);

  return {
    getProductData,
    postProductData,
    putProductData,
    deleteProductData,
    postCategoryData,
    getCategoryData,
    deleteCategoryData,
    putCategoryData,
    getUsersData,
    login,
    getallorders,
    updateOrderStatusAPI,
    verifyOrderPaymentAdminAPI,
    getOrderTransactionsAdminAPI,
    getPaymentOverviewAdminAPI,
  };
};

export default useAdminService;
