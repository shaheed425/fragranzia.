import { Navigate, Outlet, useLocation } from "react-router-dom";
import AdminLayout from "../layout/admin-layout/AdminLayout";
import useAuth from "../../Hooks/useAuth";

const AdminProtectedRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (auth?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminProtectedRoute;
