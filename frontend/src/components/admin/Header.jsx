import { useContext } from "react";
import { AdminAuthContext } from "../../context/AdminAuthContext";

const Header = () => {
  const { logout } = useContext(AdminAuthContext);
  return (
    <div className="header">
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Header;
