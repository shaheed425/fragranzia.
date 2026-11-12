import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import useUserService from "../service/user-api-service/UserService";
import { AddressContext } from "./contexts";

export const AddressProvider = ({ children }) => {
  const {
    addAddressAPI,
    getAddressesAPI,
    editAddressAPI,
    deleteAddressAPI,
    setDefaultAddressAPI,
  } = useUserService();

  const [address, setAddress] = useState({});
  const [fetchedAddress, setFetchedAddress] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAddresses = useCallback(async () => {
    try {
      const res = await getAddressesAPI();
      setFetchedAddress(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  }, [getAddressesAPI]);

  const addAddress = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const res = await addAddressAPI(data);
        await getAddresses();
        toast.success("Address added successfully");
        return res?.data;
      } catch (err) {
        const message = err.response?.data?.message || "Failed to add address";
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addAddressAPI, getAddresses]
  );

  const editAddress = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        await editAddressAPI(id, data);
        await getAddresses();
        toast.success("Address updated");
      } catch (err) {
        const message = err.response?.data?.message || "Failed to update address";
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [editAddressAPI, getAddresses]
  );

  const deleteAddress = useCallback(
    async (id) => {
      try {
        setLoading(true);
        await deleteAddressAPI(id);
        await getAddresses();
        toast.success("Address deleted");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete address");
      } finally {
        setLoading(false);
      }
    },
    [deleteAddressAPI, getAddresses]
  );

  const setDefaultAddress = useCallback(
    async (id) => {
      try {
        setLoading(true);
        await setDefaultAddressAPI(id);
        await getAddresses();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update default address");
      } finally {
        setLoading(false);
      }
    },
    [setDefaultAddressAPI, getAddresses]
  );

  return (
    <AddressContext.Provider
      value={{
        address,
        setAddress,
        addAddress,
        editAddress,
        deleteAddress,
        loading,
        fetchedAddress,
        setFetchedAddress,
        getAddresses,
        setDefaultAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};
