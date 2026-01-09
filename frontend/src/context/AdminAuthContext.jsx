import { createContext, useState } from "react";
import api from "../api/axios";

export const AdminAuthContext = createContext();

const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(
    localStorage.getItem("adminToken") ? { role: "superadmin" } : null
  );

  const login = async (email, password) => {
    const res = await api.post("/admin/login", { email, password });
    localStorage.setItem("adminToken", res.data.token);
    setAdmin(res.data.admin);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
