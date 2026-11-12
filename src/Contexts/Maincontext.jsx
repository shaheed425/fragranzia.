import { useCallback, useEffect, useState } from "react";
import useUserService from "../service/user-api-service/UserService";
import { Maincontext } from "./contexts";

const Mainprovider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getProductsAPI } = useUserService();

  const fetchProducts = useCallback(
    async (search = "", sort = "", category = "") => {
      try {
        setLoading(true);
        const res = await getProductsAPI(search, sort, category);
        setData(res.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [getProductsAPI]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Maincontext.Provider value={{ data, setData, fetchProducts, loading }}>
      {children}
    </Maincontext.Provider>
  );
};

export default Mainprovider;
