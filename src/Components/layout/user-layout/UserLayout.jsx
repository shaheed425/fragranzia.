import NavBar from "../../NavBar";
import Footer from "../../Footer";

const UserLayout = ({ children }) => {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
};

export default UserLayout;
