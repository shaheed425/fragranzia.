import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./contexts";
import { axiosPrivate, clearStoredAuth, isTokenValid } from "../Axios";

const readStoredAuth = () => {
  const token = localStorage.getItem("token");
  if (!isTokenValid(token)) {
    clearStoredAuth();
    return {};
  }
  return {
    token,
    role: localStorage.getItem("role"),
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
  };
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState(readStoredAuth);
  const authRef = useRef(auth);

  const setAuth = (nextAuthOrUpdater) => {
    setAuthState((prev) => {
      const next =
        typeof nextAuthOrUpdater === "function"
          ? nextAuthOrUpdater(prev)
          : nextAuthOrUpdater;
      const normalized = next || {};
      authRef.current = normalized;
      return normalized;
    });
  };

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  useEffect(() => {
    const resIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;
        const msg = error?.response?.data?.message || "";
        const isAuthFailure =
          status === 401 ||
          (status === 403 && msg.toLowerCase().includes("disabled"));

        if (isAuthFailure && (authRef.current?.token || localStorage.getItem("token"))) {
          clearStoredAuth();
          authRef.current = {};
          setAuthState({});
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.response.eject(resIntercept);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
