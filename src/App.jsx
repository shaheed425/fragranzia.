import "./App.css";
import Home from "./Pages/Home";
import Cart from "./Pages/Cart";
import { Routes, Route, Navigate } from "react-router-dom";
import Alproducts from "./Pages/Alproducts";
import Checkout from "./Pages/Checkout";
import Singleproduct from "./Pages/Singleproduct";
import Wishlist from "./Pages/Wishlist";
import Product from "./Pages/admin/Product";
import Dasboard from "./Pages/admin/Dasboard";
import Productadding from "./Pages/admin/Productadding";
import Addcategory from "./Pages/admin/Addcategory";
import Profile from "./Pages/user/Profile";
import Orderdetails from "./Pages/user/Orderdetails";
import Category from "./Pages/admin/Category";
import Login from "./Pages/user/Login";
import Register from "./Pages/user/Register";
import AdminLogin from "./Pages/admin/AdminLogin";
import AdminProtectedRoute from "./Components/protectroutes/AdminProtectedRoute";
import LoginProtectedRoute from "./Components/protectroutes/LoginProtectedRoute";
import Orders from "./Pages/admin/Orders";
import Payments from "./Pages/admin/Payments";
import Users from "./Pages/admin/Users";
import UserProtectedRoute from "./Components/protectroutes/UserProtectedRoute";
import { Toaster } from "react-hot-toast";
import OrderSuccessPage from "./Pages/user/OrderSuccessPage";
import PaymentStatusPage from "./Pages/user/PaymentStatusPage";
import ScrollToTop from "./Components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Guest only routes */}
        <Route element={<LoginProtectedRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Alproducts />} />
        <Route path="/single/:id" element={<Singleproduct />} />

        {/* User protected routes */}
        <Route element={<UserProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orderdetails" element={<Orderdetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/OrderSuccessPage" element={<OrderSuccessPage />} />
          <Route path="/payment-status/:orderId" element={<PaymentStatusPage />} />
        </Route>

        {/* Admin protected routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<Navigate to="/addashboard" replace />} />
          <Route path="/adproduct" element={<Product />} />
          <Route path="/addashboard" element={<Dasboard />} />
          <Route path="/productadding" element={<Productadding />} />
          <Route path="/productadding/:id" element={<Productadding />} />
          <Route path="/category" element={<Category />} />
          <Route path="/addcategory" element={<Addcategory />} />
          <Route path="/addcategory/:id" element={<Addcategory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/adpayments" element={<Payments />} />
          <Route path="/allusers" element={<Users />} />
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
