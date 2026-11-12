import { useCallback, useContext, useState } from "react";
import { Maincontext, NavbarContext } from "./contexts";

const NavbarProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const { fetchProducts } = useContext(Maincontext);

  const search = useCallback(
    (e) => {
      const term = e.target.value;
      setInput(term);
      fetchProducts(term);
    },
    [fetchProducts]
  );

  return (
    <NavbarContext.Provider value={{ search, input, setInput }}>
      {children}
    </NavbarContext.Provider>
  );
};

export default NavbarProvider;
