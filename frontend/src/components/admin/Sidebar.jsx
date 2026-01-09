// import { Link } from "react-router-dom";

// const Sidebar = () => (
//   <div className="sidebar">
//     <h2>Admin</h2>
//     <Link to="/admin/dashboard">Dashboard</Link>
//     <Link to="/admin/categories">Categories</Link>
//     <Link to="/admin/news">News</Link>
//     <Link to="/admin/homepage">Homepage</Link>
//   </div>
// );

// export default Sidebar;

import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => (
  <div className="sidebar">
    <h2>Admin</h2>
    <NavLink to="/admin/dashboard">Dashboard</NavLink>
    <NavLink to="/admin/categories">Categories</NavLink>
    <NavLink to="/admin/news">News</NavLink>
    <NavLink to="/admin/homepage">Homepage</NavLink>
  </div>
);

export default Sidebar;
