// import Sidebar from "./Sidebar";
// import Header from "./Header";

// const AdminLayout = ({ children }) => (
//   <div className="admin-layout">
//     <Sidebar />
//     <div className="admin-content">
//       <Header />
//       {children}
//     </div>
//   </div>
// );

// export default AdminLayout;
import Sidebar from "./Sidebar";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
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
