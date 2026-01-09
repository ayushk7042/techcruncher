// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../../api/axios";

// const News = () => {
//   const [news, setNews] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchNews = async () => {
//     try {
//       const res = await api.get("/news"); // ADMIN – GET ALL
//       setNews(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load news");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteNews = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this news?")) return;

//     try {
//       await api.delete(`/news/${id}`);
//       setNews(prev => prev.filter(n => n._id !== id));
//     } catch (err) {
//       alert("Delete failed");
//     }
//   };

//   useEffect(() => {
//     fetchNews();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="admin-page">
//       <div className="page-header">
//         <h2>All News</h2>
//         <Link to="/admin/news/add" className="btn">
//           + Add News
//         </Link>
//       </div>

//       <table className="admin-table">
//         <thead>
//           <tr>
//             <th>Title</th>
//             <th>Category</th>
//             <th>Status</th>
//             <th>Sponsored</th>
//             <th>Views</th>
//             <th>Created</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {news.map(item => (
//             <tr key={item._id}>
//               <td>{item.title}</td>
//               <td>{item.category?.name}</td>
//               <td>{item.status}</td>
//               <td>{item.isSponsored ? "Yes" : "No"}</td>
//               <td>{item.views}</td>
//               <td>{new Date(item.createdAt).toLocaleDateString()}</td>
//               <td>
//                 <Link
//                   to={`/admin/news/edit/${item._id}`}
//                   className="btn-sm"
//                 >
//                   Edit
//                 </Link>
//                 <button
//                   onClick={() => deleteNews(item._id)}
//                   className="btn-sm danger"
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default News;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const res = await api.get("/news"); // ADMIN – GET ALL
      setNews(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    try {
      await api.delete(`/news/${id}`);
      setNews(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>All News</h2>
        <div className="header-actions">
          <Link to="/admin/dashboard" className="btn secondary">
            ← Dashboard
          </Link>
          <Link to="/admin/news/add" className="btn">
            + Add News
          </Link>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Sponsored</th>
            <th>Views</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {news.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No news found
              </td>
            </tr>
          )}

          {news.map(item => (
            <tr key={item._id}>
              <td>{item.title}</td>
              <td>{item.category?.name || "-"}</td>
              <td>{item.status}</td>
              <td>{item.isSponsored ? "Yes" : "No"}</td>
              <td>{item.views}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                <Link
                  to={`/admin/news/edit/${item._id}`}
                  className="btn-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteNews(item._id)}
                  className="btn-sm danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default News;
