import { useContext } from "react";
import { AuthContext } from "../Contexts/contexts";

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
