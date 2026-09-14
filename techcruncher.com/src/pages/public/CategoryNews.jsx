import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import "./CategoryNews.css";
import { getNewsPath } from "../../utils/newsUrl";

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

  const handleShare = (item) => {
    const url = `${window.location.origin}${getNewsPath(item)}`;
    const title = item?.title || "News";
    const text = encodeURIComponent(`${title} ${url}`);
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      const wa = `https://wa.me/?text=${text}`;
      window.open(wa, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="cn-root">
        <div className="cn-loading">
          <div className="cn-loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cn-root">
        <div className="cn-error">
          <p>❌ {error}</p>
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="cn-root">
        <div className="cn-empty">
          <p>📭 No news found in this category.</p>
        </div>
      </div>
    );
  }

  const topNews = news[0];
  const restNews = news.slice(1);
  const featured = restNews.slice(0, 2);
  const allNews = restNews.slice(2);

  return (
    <div className="cn-root">
      {/* ========== HEADER ========== */}
      <section className="cn-header">
        <div className="cn-header-content">
          <span className="cn-header-label">Category</span>
          <h1 className="cn-header-title">{category?.name}</h1>
          <p className="cn-header-desc">
            {category?.description || `Explore the latest news in ${category?.name}`}
          </p>
        </div>
      </section>

      {/* ========== FEATURED HERO ========== */}
      {topNews && (
        <section className="cn-hero">
          <div className="cn-hero-media">
            <Link to={getNewsPath(topNews)}>
              <img src={topNews.image?.url || "/placeholder.jpg"} alt={topNews.title} />
            </Link>
          </div>
          <div className="cn-hero-body">
            <div className="cn-hero-meta">
              <span className="cn-hero-badge">Featured</span>
              {topNews.isSponsored && <span className="cn-hero-sponsored">Sponsored</span>}
              <span className="cn-hero-sep">·</span>
              <span className="cn-hero-category">{category?.name}</span>
            </div>
            <h2 className="cn-hero-title">
              <Link to={getNewsPath(topNews)}>{topNews.title}</Link>
            </h2>
            <div className="cn-hero-subinfo">
              <span>By {topNews.author || "Editorial"}</span>
              <span>·</span>
              <span>{new Date(topNews.createdAt).toLocaleDateString()}</span>
              <span>·</span>
              <span>3 min read</span>
            </div>
            <div className="cn-hero-actions">
              <Link to={getNewsPath(topNews)} className="cn-hero-read">
                Read full story →
              </Link>
              <button type="button" className="cn-hero-icon" aria-label="Save">
                🔖 Save
              </button>
              <button
                type="button"
                className="cn-hero-icon"
                onClick={() => handleShare(topNews)}
                aria-label="Share"
              >
                ↗ Share
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========== FEATURED CARDS ========== */}
      {featured.length > 0 && (
        <section className="cn-featured">
          <h3 className="cn-featured-title">✨ Must Read</h3>
          <div className="cn-featured-grid">
            {featured.map((n, idx) => (
              <article key={n._id} className="cn-featured-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                <Link to={getNewsPath(n)}>
                  <div className="cn-featured-img-wrap">
                    <img src={n.image?.url || "/placeholder.jpg"} alt={n.title} />
                  </div>
                  <div className="cn-featured-body">
                    <span className="cn-featured-meta">
                      {n.category?.name} · {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                    <h4>{n.title}</h4>
                    <span className="cn-featured-link">Read →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ========== ALL NEWS GRID ========== */}
      {allNews.length > 0 && (
        <section className="cn-all-news cn-relative">
          <span className="cn-float-label">All Stories</span>
          <div className="cn-news-grid">
            {allNews.map((n, idx) => (
              <article key={n._id} className="cn-news-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                <Link to={getNewsPath(n)}>
                  <div className="cn-card-img-wrap">
                    <img src={n.image?.url || "/placeholder.jpg"} alt={n.title} />
                  </div>
                  <div className="cn-card-body">
                    <span className="cn-card-meta">
                      {n.category?.name} · {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                    <h5>{n.title}</h5>
                    <span className="cn-card-link">Read →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CategoryNews;
