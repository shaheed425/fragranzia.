import { useContext } from "react";
import { FaTachometerAlt, FaBox, FaTags, FaUsers, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
import { Adminproductcontext } from "../Contexts/contexts";

const Adminslide = () => {
  const { showslide } = useContext(Adminproductcontext);
  return (
    <div>
      {showslide && (
        <div className="w-64 bg-white h-screen shadow-md flex flex-col justify-between fixed left-0 top-0">
          <div>
            <h1 className="text-2xl font-bold text-green-600 p-5">Dashtar</h1>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-3 px-5 py-2 cursor-pointer hover:bg-gray-100">
                <FaTachometerAlt className="text-gray-700" />
                <span className="text-gray-700">Dashboard</span>
              </li>
              <li className="flex items-center gap-3 px-5 py-2 cursor-pointer hover:bg-gray-100">
                <FaBox className="text-gray-700" />
                <span className="text-gray-700">Products</span>
              </li>
              <li className="flex items-center gap-3 px-5 py-2 cursor-pointer hover:bg-gray-100">
                <FaTags className="text-gray-700" />
                <span className="text-gray-700">Categories</span>
              </li>
              <li className="flex items-center gap-3 px-5 py-2 cursor-pointer hover:bg-gray-100">
                <FaTags className="text-gray-700" />
                <span className="text-gray-700">Offers</span>
              </li>
              <li className="flex items-center gap-3 px-5 py-2 cursor-pointer hover:bg-gray-100">
                <FaUsers className="text-gray-700" />
                <span className="text-gray-700">Customers</span>
              </li>
              <li className="flex items-center gap-3 px-5 py-2 cursor-pointer hover:bg-gray-100">
                <FaShoppingCart className="text-gray-700" />
                <span className="text-gray-700">Orders</span>
              </li>
            </ul>
          </div>
          <div className="p-5">
            <button className="flex items-center gap-3 bg-green-600 text-white w-full py-2 rounded-lg">
              <FaSignOutAlt />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adminslide;
