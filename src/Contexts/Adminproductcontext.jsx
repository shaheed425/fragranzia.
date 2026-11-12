import { useCallback, useState } from "react";
import useAdminService from "../service/admin-api-service/adminservice";
import { Adminproductcontext } from "./contexts";

const AdminproductProvider = ({ children }) => {
  const [showslide, setShowslide] = useState(false);
  const [users, setUser] = useState([]);
  const { getUsersData } = useAdminService();

  const fetchusers = useCallback(async () => {
    try {
      const res = await getUsersData();
      setUser(res.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [getUsersData]);

  return (
    <Adminproductcontext.Provider value={{ showslide, setShowslide, fetchusers, users }}>
      {children}
    </Adminproductcontext.Provider>
  );
};

export default AdminproductProvider;
