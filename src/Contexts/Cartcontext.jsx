import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import useUserService from "../service/user-api-service/UserService";
import { Cartcontext } from "./contexts";

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { auth } = useAuth();
  const { addcartt, fetchcart, deletecart, increaseqty, decreseqty } = useUserService();
  const navigate = useNavigate();

  const fetchcartproduct = useCallback(async () => {
    if (!auth?.token) {
      setCart([]);
      return;
    }
    try {
      const res = await fetchcart();
      setCart(res?.data?.cart || []);
    } catch (error) {
      console.error("Fetch cart error:", error);
    }
  }, [auth?.token, fetchcart]);

  useEffect(() => {
    if (!auth?.token) return;
    let active = true;
    fetchcart()
      .then((res) => {
        if (active) setCart(res?.data?.cart || []);
      })
      .catch((error) => {
        console.error("Fetch cart error:", error);
      });
    return () => {
      active = false;
    };
  }, [auth?.token, fetchcart]);

  const addcart = useCallback(
    async (_id, size) => {
      if (!auth?.token) {
        toast.error("Please login to add items to cart");
        navigate("/login");
        return false;
      }
      try {
        const res = await addcartt(_id, size);
        toast.success("Successfully Added!");
        setCart(res.data?.data || []);
        return true;
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Login Required!");
          navigate("/login");
          return false;
        }
        const message =
          error.response?.data?.message || "Out of stock from admin side";
        toast.error(message);
        return false;
      }
    },
    [auth?.token, addcartt, navigate]
  );

  const removeitem = useCallback(
    async (_id, size) => {
      try {
        const res = await deletecart(_id, size);
        toast.success("Successfully deleted!");
        setCart(res?.cart || []);
      } catch (error) {
        console.error(error);
        toast.error("Error removing item");
      }
    },
    [deletecart]
  );

  const incrementqty = useCallback(
    async (productId, size) => {
      try {
        const res = await increaseqty(productId, size);
        setCart(Array.isArray(res) ? res : []);
      } catch (err) {
        const message =
          err.response?.data?.message || "Out of stock from admin side";
        toast.error(message);
      }
    },
    [increaseqty]
  );

  const decrementqty = useCallback(
    async (productId, size) => {
      try {
        const res = await decreseqty(productId, size);
        setCart(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to update quantity");
      }
    },
    [decreseqty]
  );

  const handlePlaceOrder = useCallback(() => {
    navigate("/checkout");
  }, [navigate]);

  return (
    <Cartcontext.Provider
      value={{
        cart: auth?.token ? cart : [],
        setCart,
        addcart,
        incrementqty,
        decrementqty,
        removeitem,
        fetchcartproduct,
        handlePlaceOrder,
      }}
    >
      {children}
    </Cartcontext.Provider>
  );
};

export default CartProvider;
