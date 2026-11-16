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

      // Optimistic update: instantly toggle heart and count on screen (0ms delay)
      const previousWishlist = [...wishlistData];
      const isAlreadyInWishlist = wishlistData.some(
        (item) => (typeof item === "object" ? item._id : item) === id
      );

      let optimisticList;
      if (isAlreadyInWishlist) {
        optimisticList = wishlistData.filter(
          (item) => (typeof item === "object" ? item._id : item) !== id
        );
        toast.success("Removed from wishlist", { id: "wishlist-toast" });
      } else {
        optimisticList = [...wishlistData, { _id: id }];
        toast.success("Added to wishlist!", { id: "wishlist-toast" });
      }
      setWishlistData(optimisticList);

      try {
        const res = await addwishlist(id);
        if (res && res.data) {
          setWishlistData(res.data);
          return true;
        }
        return false;
      } catch (error) {
        // Rollback on network failure
        setWishlistData(previousWishlist);
        if (error.response?.status === 401) {
          toast.error("Login Required!", { id: "wishlist-toast" });
          navigate("/login");
          return false;
        }
        toast.error(error.response?.data?.message || "Failed to update wishlist", {
          id: "wishlist-toast",
        });
        return false;
      }
    },
    [auth?.token, wishlistData, addwishlist, navigate]
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
