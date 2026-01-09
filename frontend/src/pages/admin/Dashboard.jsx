
import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";
import "./Dashboard.css";


const Dashboard = () => {
  const [stats, setStats] = useState({
    news: 0,
    categories: 0,
    sponsored: 0
  });

  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const newsRes = await api.get("/news");
      const catRes = await api.get("/category");

      const sponsoredCount = newsRes.data.filter(n => n.isSponsored).length;

      setStats({
        news: newsRes.data.length,
        categories: catRes.data.length,
        sponsored: sponsoredCount
      });

      setLatestNews(newsRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="dashboard">
        {/* HEADER */}
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage news, categories & homepage content</p>
        </div>

        {/* STATS CARDS */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total News</h3>
            <p>{stats.news}</p>
          </div>

          <div className="stat-card">
            <h3>Categories</h3>
            <p>{stats.categories}</p>
          </div>

          <div className="stat-card highlight">
            <h3>Sponsored Posts</h3>
            <p>{stats.sponsored}</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">
          <a href="/admin/news/add" className="action-card">
            ➕ Add News
          </a>
          <a href="/admin/categories" className="action-card">
            📂 Manage Categories
          </a>
          <a href="/admin/homepage" className="action-card">
            🏠 Homepage Manager
          </a>
        </div>

        {/* LATEST NEWS */}
        <div className="latest-section">
          <h2>Latest News</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestNews.map(n => (
                <tr key={n._id}>
                  <td>{n.title}</td>
                  <td>{n.category?.name}</td>
                  <td>
                    <span className={`status ${n.status}`}>
                      {n.status}
                    </span>
                  </td>
                  <td>{new Date(n.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
