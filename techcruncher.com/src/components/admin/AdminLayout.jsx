// // import Sidebar from "./Sidebar";
// // import Header from "./Header";

// // const AdminLayout = ({ children }) => (
// //   <div className="admin-layout">
// //     <Sidebar />
// //     <div className="admin-content">
// //       <Header />
// //       {children}
// //     </div>
// //   </div>
// // );

// // export default AdminLayout;
// import Sidebar from "./Sidebar";
// import "./AdminLayout.css";

// const AdminLayout = ({ children }) => {
//   return (
//     <div className="admin-layout">
//       <Sidebar />
//       <main className="admin-content">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default AdminLayout;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login");
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return null; // ⛔ prevent API calls before auth

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
