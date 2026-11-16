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

      // Optimistic update: instant UI response (0ms)
      const previousCart = [...cart];
      const matchIndex = cart.findIndex(
        (c) =>
          ((c.product?._id || c.product) === _id) &&
          (!size || (c.size || "") === (size || ""))
      );

      if (matchIndex > -1) {
        const nextCart = [...cart];
        nextCart[matchIndex] = {
          ...nextCart[matchIndex],
          quantity: (nextCart[matchIndex].quantity || 1) + 1,
        };
        setCart(nextCart);
      } else {
        setCart([...cart, { product: { _id }, quantity: 1, size: size || "" }]);
      }
      toast.success("Added to Cart!", { id: "cart-toast" });

      try {
        const res = await addcartt(_id, size);
        setCart(res.data?.data || []);
        return true;
      } catch (error) {
        // Rollback on failure
        setCart(previousCart);
        if (error.response?.status === 401) {
          toast.error("Login Required!", { id: "cart-toast" });
          navigate("/login");
          return false;
        }
        const message =
          error.response?.data?.message || "Out of stock from admin side";
        toast.error(message, { id: "cart-toast" });
        return false;
      }
    },
    [auth?.token, cart, addcartt, navigate]
  );

  const removeitem = useCallback(
    async (_id, size) => {
      const previousCart = [...cart];
      setCart((prev) =>
        prev.filter(
          (c) =>
            !(
              ((c.product?._id || c.product) === _id) &&
              (!size || (c.size || "") === (size || ""))
            )
        )
      );
      toast.success("Removed from cart", { id: "cart-toast" });

      try {
        const res = await deletecart(_id, size);
        setCart(res?.cart || []);
      } catch (error) {
        setCart(previousCart);
        console.error(error);
        toast.error("Error removing item", { id: "cart-toast" });
      }
    },
    [cart, deletecart]
  );

  const incrementqty = useCallback(
    async (productId, size) => {
      const previousCart = [...cart];
      setCart((prev) =>
        prev.map((c) => {
          if (
            ((c.product?._id || c.product) === productId) &&
            (!size || (c.size || "") === (size || ""))
          ) {
            return { ...c, quantity: (c.quantity || 1) + 1 };
          }
          return c;
        })
      );

      try {
        const res = await increaseqty(productId, size);
        setCart(Array.isArray(res) ? res : []);
      } catch (err) {
        setCart(previousCart);
        const message =
          err.response?.data?.message || "Out of stock from admin side";
        toast.error(message);
      }
    },
    [cart, increaseqty]
  );

  const decrementqty = useCallback(
    async (productId, size) => {
      const previousCart = [...cart];
      setCart((prev) =>
        prev
          .map((c) => {
            if (
              ((c.product?._id || c.product) === productId) &&
              (!size || (c.size || "") === (size || ""))
            ) {
              return { ...c, quantity: (c.quantity || 1) - 1 };
            }
            return c;
          })
          .filter((c) => (c.quantity || 0) > 0)
      );

      try {
        const res = await decreseqty(productId, size);
        setCart(Array.isArray(res) ? res : []);
      } catch (err) {
        setCart(previousCart);
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to update quantity");
      }
    },
    [cart, decreseqty]
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
