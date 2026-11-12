import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import Mainprovider from "./Contexts/Maincontext.jsx";
import CartProvider from "./Contexts/Cartcontext.jsx";
import NavbarProvider from "./Contexts/NavbarContext.jsx";
import CheckoutProvider from "./Contexts/Checkoutcontext.jsx";
import WishlistProvider from "./Contexts/Wishlistcontext.jsx";
import AdminproductProvider from "./Contexts/Adminproductcontext.jsx";
import CategoryProvider from "./Contexts/Categorycontext.jsx";
import { AuthProvider } from "./Contexts/AuthContext.jsx";
import { AddressProvider } from "./Contexts/AddressContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <AddressProvider>
        <Mainprovider>
          <CartProvider>
            <NavbarProvider>
              <CheckoutProvider>
                <WishlistProvider>
                  <AdminproductProvider>
                    <CategoryProvider>
                      <App />
                    </CategoryProvider>
                  </AdminproductProvider>
                </WishlistProvider>
              </CheckoutProvider>
            </NavbarProvider>
          </CartProvider>
        </Mainprovider>
      </AddressProvider>
    </AuthProvider>
  </BrowserRouter>
);
