// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import AdminAuthProvider from "./context/AdminAuthContext";
// import ProtectedRoute from "./components/admin/ProtectedRoute";

// import AddEditCategory from "./pages/admin/AddEditCategory";
// import Login from "./pages/admin/Login";
// import Dashboard from "./pages/admin/Dashboard";
// import Categories from "./pages/admin/Categories";
// import News from "./pages/admin/News";
// import HomepageManager from "./pages/admin/HomepageManager";
// import Home from "./pages/public/Home";
// import AddEditNews from "./pages/admin/AddEditNews";

// import Footer from "./components/Footer";


// import CategoryNews from "./pages/public/CategoryNews";
// import Navbar from "./components/Navbar";

// import NewsPage from "./pages/public/NewsPage";

// const App = () => (
//   <AdminAuthProvider>
//     <BrowserRouter>
//      <Navbar /> 
//       <Routes>


//         <Route path="/" element={<Home />} />
//         <Route path="/news/:id" element={<NewsPage />} />
//          <Route path="/category/:categoryId" element={<CategoryNews />} />
//         <Route path="/admin/login" element={<Login />} />
//         <Route
//           path="/admin/dashboard"
//           element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
//         />
//         <Route
//           path="/admin/categories"
//           element={<ProtectedRoute><Categories /></ProtectedRoute>}
//         />
// <Route
//   path="/admin/categories/add"
//   element={
//     <ProtectedRoute>
//       <AddEditCategory />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/admin/categories/edit/:id"
//   element={
//     <ProtectedRoute>
//       <AddEditCategory />
//     </ProtectedRoute>
//   }
// />

//         <Route
//           path="/admin/news"
//           element={<ProtectedRoute><News /></ProtectedRoute>}
//         />

// <Route path="/admin/news/add" element={
//   <ProtectedRoute>
//     <AddEditNews />
//   </ProtectedRoute>
// } />

// <Route path="/admin/news/edit/:id" element={
//   <ProtectedRoute>
//     <AddEditNews />
//   </ProtectedRoute>
// } />

//         <Route
//           path="/admin/homepage"
//           element={<ProtectedRoute><HomepageManager /></ProtectedRoute>}
//         />
//       </Routes>
// <Footer 
//   categories={categories} 
//   topCategories={categories.slice(0,5)} 
//   recentNews={recentNews} 
// />

//     </BrowserRouter>
//   </AdminAuthProvider>
// );

// export default App;



import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminAuthProvider from "./context/AdminAuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import AddEditCategory from "./pages/admin/AddEditCategory";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import News from "./pages/admin/News";
import HomepageManager from "./pages/admin/HomepageManager";
import Home from "./pages/public/Home";
import AddEditNews from "./pages/admin/AddEditNews";
import CategoryNews from "./pages/public/CategoryNews";
import NewsPage from "./pages/public/NewsPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import api from "./api/axios";

const App = () => {
  const [categories, setCategories] = useState([]);
  const [recentNews, setRecentNews] = useState([]);

  // ================== LOAD CATEGORIES ==================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/category");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  // ================== LOAD RECENT NEWS ==================
  useEffect(() => {
    const loadRecentNews = async () => {
      try {
        const res = await api.get("/news"); // assume backend returns all news
        setRecentNews(res.data);
      } catch (err) {
        console.error("Failed to load recent news", err);
      }
    };
    loadRecentNews();
  }, []);

  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news/:id" element={<NewsPage />} />
          <Route path="/category/:categoryId" element={<CategoryNews />} />
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/categories"
            element={<ProtectedRoute><Categories /></ProtectedRoute>}
          />
          <Route
            path="/admin/categories/add"
            element={<ProtectedRoute><AddEditCategory /></ProtectedRoute>}
          />
          <Route
            path="/admin/categories/edit/:id"
            element={<ProtectedRoute><AddEditCategory /></ProtectedRoute>}
          />
          <Route
            path="/admin/news"
            element={<ProtectedRoute><News /></ProtectedRoute>}
          />
          <Route
            path="/admin/news/add"
            element={<ProtectedRoute><AddEditNews /></ProtectedRoute>}
          />
          <Route
            path="/admin/news/edit/:id"
            element={<ProtectedRoute><AddEditNews /></ProtectedRoute>}
          />
          <Route
            path="/admin/homepage"
            element={<ProtectedRoute><HomepageManager /></ProtectedRoute>}
          />
        </Routes>

        {/* ===== FOOTER ===== */}
        <Footer
          categories={categories}
          topCategories={categories.slice(0, 5)}
          recentNews={recentNews}
        />

      </BrowserRouter>
    </AdminAuthProvider>
  );
};

export default App;
