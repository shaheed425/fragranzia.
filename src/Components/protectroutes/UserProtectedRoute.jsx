import { Navigate, Outlet, useLocation } from "react-router-dom";
import UserLayout from "../layout/user-layout/UserLayout";
import useAuth from "../../Hooks/useAuth";

const UserProtectedRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
};

export default UserProtectedRoute;
