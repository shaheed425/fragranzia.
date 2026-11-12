import { useCallback, useEffect, useState } from "react";
import useAdminService from "../service/admin-api-service/adminservice";
import { Categorycontext } from "./contexts";

const CategoryProvider = ({ children }) => {
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getCategoryData } = useAdminService();

  const fetchCategory = useCallback(async () => {
    try {
      const res = await getCategoryData();
      setCategory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }, [getCategoryData]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return (
    <Categorycontext.Provider value={{ category, setCategory, loading, fetchCategory }}>
      {children}
    </Categorycontext.Provider>
  );
};

export default CategoryProvider;
