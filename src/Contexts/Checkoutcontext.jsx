import { useState } from "react";
import { Checkoutcontext } from "./contexts";

const CheckoutProvider = ({ children }) => {
  const [editshow, setEditshow] = useState(false);

  return (
    <Checkoutcontext.Provider value={{ editshow, setEditshow }}>
      {children}
    </Checkoutcontext.Provider>
  );
};

export default CheckoutProvider;
