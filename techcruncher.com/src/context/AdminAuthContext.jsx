// import { createContext, useState, useEffect } from "react";
// import api from "../api/axios";

// export const AdminAuthContext = createContext();

// const AdminAuthProvider = ({ children }) => {
//   // const [admin, setAdmin] = useState(
//   //   localStorage.getItem("adminToken") ? { role: "superadmin" } : null
//   // );

//   const [admin, setAdmin] = useState(null);

// // ✅ Persistent login
//   useEffect(() => {
//     const token = localStorage.getItem("adminToken");
//     if (token) {
//       // Optionally decode token for admin info
//       const payload = JSON.parse(atob(token.split(".")[1])); // simple JWT decode
//       setAdmin(payload); 
//     }
//   }, []);


//   const login = async (email, password) => {
//     const res = await api.post("/admin/login", { email, password });
//     localStorage.setItem("adminToken", res.data.token);
//     setAdmin(res.data.admin);
//   };

//   const logout = () => {
//     localStorage.removeItem("adminToken");
//     setAdmin(null);
//   };

//   return (
//     <AdminAuthContext.Provider value={{ admin, login, logout }}>
//       {children}
//     </AdminAuthContext.Provider>
//   );
// };

// export default AdminAuthProvider;



import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AdminAuthContext = createContext();

const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  // ✅ Load token from localStorage on page load
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // simple JWT decode
        setAdmin(payload); 
      } catch (e) {
        console.error("Invalid token", e);
        localStorage.removeItem("adminToken");
      }
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/admin/login", { email, password });
    localStorage.setItem("adminToken", res.data.token);
    //setAdmin(res.data.admin); 
    const payload = JSON.parse(atob(res.data.token.split(".")[1]));
setAdmin(payload);

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
