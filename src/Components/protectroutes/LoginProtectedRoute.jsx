import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";

const LoginProtectedRoute = () => {
  const { auth } = useAuth();

  if (auth?.token) {
    return <Navigate to={auth.role === "admin" ? "/addashboard" : "/"} replace />;
  }

  return <Outlet />;
};

export default LoginProtectedRoute;
