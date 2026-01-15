
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./CategoryNews.css";

const CategoryNews = () => {
  const { categoryId } = useParams();

  const [news, setNews] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!categoryId) return;

    const loadNews = async () => {
      try {
        const res = await api.get(`/news/category/${categoryId}`);
        setNews(Array.isArray(res?.data?.news) ? res.data.news : []);
        setCategory(res?.data?.category || null);
      } catch (err) {
        setError("Failed to load news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryId]);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!news.length) return <p className="empty">No news found.</p>;

  const topNews = news[0];
  const restNews = news.slice(1);
  const trending = restNews.slice(0, 5);

  return (
    <div className="category-page">

      {/* ===== HEADER ===== */}
      <header className="category-header">
        <h1>{category?.name}</h1>
        <p>{category?.description}</p>
      </header>

      {/* ===== TOP NEWS ===== */}
      {topNews && (
        <Link to={`/news/${topNews._id}`} className="top-news">
          <img src={topNews.image?.url || "/placeholder.jpg"} />
          <div>
            <span className="badge">TOP</span>
            <h2>{topNews.title}</h2>
          </div>
        </Link>
      )}

      {/* ===== CONTENT GRID ===== */}
      <div className="content-grid">

        {/* ===== LEFT NEWS ===== */}
        <div className="news-list">
          {restNews.map((item, index) => (
            <div key={item._id}>
              <Link to={`/news/${item._id}`} className="news-row">
                <img src={item.image?.url || "/placeholder.jpg"} />
                <div>
                  <h3>{item.title}</h3>
                  <small>
                    {new Date(item.createdAt).toDateString()}
                  </small>
                </div>
              </Link>

              {(index + 1) % 4 === 0 && (
                <div className="affiliate-ad">
                  <span>Sponsored</span>
                  <img src="/ads/sample-ad.jpg" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        {/* <aside className="sidebar">

          <div className="sidebar-box">
            <h4>🔥 Trending</h4>
            {trending.map(t => (
              <Link key={t._id} to={`/news/${t._id}`}>
                {t.title}
              </Link>
            ))}
          </div>

          <div className="sidebar-box">
            <h4>📩 Newsletter</h4>
            <input placeholder="Your email" />
            <button>Subscribe</button>
          </div>

          <div className="sidebar-box ad-box">
            <span>Advertisement</span>
            <img src="/ads/sample-ad.jpg" />
          </div>

        </aside> */}
      </div>
    </div>
  );
};

export default CategoryNews;
