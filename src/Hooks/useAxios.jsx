import { useEffect } from "react";
import axiosInstance from "../Axios";
import useAuth from "./useAuth";

const useAxios = () => {
  const { auth } = useAuth();

  useEffect(() => {
    const reqIntercept = axiosInstance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    const resIntercept = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );

    return () => {
      axiosInstance.interceptors.request.eject(reqIntercept);
      axiosInstance.interceptors.response.eject(resIntercept);
    };
  }, [auth]);

  return axiosInstance;
};

export default useAxios;
