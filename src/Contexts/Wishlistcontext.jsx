import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import useUserService from "../service/user-api-service/UserService";
import { Wishlistcontext } from "./contexts";

const WishlistProvider = ({ children }) => {
  const [wishlistData, setWishlistData] = useState([]);
  const { auth } = useAuth();
  const { addwishlist, getWishlist } = useUserService();
  const navigate = useNavigate();

  const getWishlistData = useCallback(async () => {
    if (!auth?.token) {
      setWishlistData([]);
      return;
    }
    try {
      const res = await getWishlist();
      setWishlistData(res?.data || []);
    } catch (error) {
      console.error("Wishlist fetch error:", error);
    }
  }, [auth?.token, getWishlist]);

  useEffect(() => {
    if (!auth?.token) return;
    let active = true;
    getWishlist()
      .then((res) => {
        if (active) setWishlistData(res?.data || []);
      })
      .catch((error) => {
        console.error("Wishlist fetch error:", error);
      });
    return () => {
      active = false;
    };
  }, [auth?.token, getWishlist]);

  const addwish = useCallback(
    async (id) => {
      if (!auth?.token) {
        toast.error("Please login to manage your wishlist");
        navigate("/login");
        return false;
      }
      try {
        const res = await addwishlist(id);
        if (res) {
          setWishlistData(res.data || []);
          toast.success(res.message);
          return true;
        }
        return false;
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Login Required!");
          navigate("/login");
          return false;
        }
        toast.error(error.response?.data?.message || "Failed to update wishlist");
        return false;
      }
    },
    [auth?.token, addwishlist, navigate]
  );

  return (
    <Wishlistcontext.Provider
      value={{
        wishlistData: auth?.token ? wishlistData : [],
        setWishlistData,
        addwish,
        getWishlistData,
      }}
    >
      {children}
    </Wishlistcontext.Provider>
  );
};

export default WishlistProvider;
