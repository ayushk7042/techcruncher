import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import "./Home.css";
import { getNewsPath } from "../../utils/newsUrl";

const Home = () => {
  const [home, setHome] = useState(null);
  const [randomThree, setRandomThree] = useState([]);
  const [editorsPicks, setEditorsPicks] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const navigate = useNavigate();

  // Helper function to get random items from array
  const getRandomItems = (arr, count) => {
    if (!arr || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Helper function to get single random item
  const getRandomItem = (arr) => {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  useEffect(() => {
    api
      .get("/homepage")
      .then((res) => setHome(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Update random news whenever home data changes
  useEffect(() => {
    if (!home) return;

    // Get all news from subTrending (all categories)
    const allNews = home.subTrending || [];
    
    // Set random 3 news
    setRandomThree(getRandomItems(allNews, 3));
    
    // Get latest news sorted by creation date
    const sortedByDate = [...allNews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Set latest 10 news for Editor's Picks
    setEditorsPicks(sortedByDate.slice(0, 10));
    
    // Set latest 5 news
    setLatestNews(sortedByDate.slice(0, 5));
  }, [home]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    navigate("/contact");
  };

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

  if (!home) {
    return (
      <div className="hp-root">
        <div className="hp-loading">
          <div className="hp-loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const latestSorted = [...(home.subTrending || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="hp-root">
      {/* ========== HERO / FEATURED ========== */}
      <section className="hp-hero">
        <span className="hp-hero-float">Featured</span>
        <div className="hp-hero-media">
          <Link to={getNewsPath(home.mainTrending)}>
            <img
              src={home.mainTrending?.image?.url || "/placeholder.jpg"}
              alt={home.mainTrending?.title}
            />
          </Link>
        </div>
        <div className="hp-hero-body">
          <div className="hp-hero-meta">
            <span className="hp-hero-badge">Trending</span>
            {home.mainTrending?.isSponsored && (
              <span className="hp-hero-sponsored">Sponsored</span>
            )}
            <span className="hp-hero-sep">·</span>
            <span className="hp-hero-category">
              {home.mainTrending?.category?.name || "News"}
            </span>
          </div>
          <h1 className="hp-hero-title">
            <Link to={getNewsPath(home.mainTrending)}>
              {home.mainTrending?.title}
            </Link>
          </h1>
          <div className="hp-hero-subinfo">
            <span>By {home.mainTrending?.author || "Editorial"}</span>
            <span>·</span>
            <span>
              {home.mainTrending?.createdAt
                ? new Date(home.mainTrending.createdAt).toLocaleDateString()
                : "—"}
            </span>
            <span>·</span>
            <span>3 min read</span>
          </div>
          <p className="hp-hero-summary">
            {home.mainTrending?.summary || home.mainTrending?.description || ""}
          </p>
          <div className="hp-hero-actions">
            <Link
              to={getNewsPath(home.mainTrending)}
              className="hp-hero-read"
            >
              Read full story →
            </Link>
            <button
              type="button"
              className="hp-hero-icon"
              onClick={() => alert("Added to favorites!")}
              aria-label="Save"
            >
              🔖 Save
            </button>
            <button
              type="button"
              className="hp-hero-icon"
              onClick={() =>
                handleShare(home.mainTrending)
              }
              aria-label="Share"
            >
              ↗ Share
            </button>
          </div>
        </div>
      </section>


 {(home.latestNews?.length > 0 || latestSorted.length > 0) && (
        <section className="hp-ticker">
          <div className="hp-ticker-label">Latest</div>
          <div className="hp-ticker-wrap">
            <div className="hp-ticker-track">
              {(home.latestNews || latestSorted).slice(0, 8).map((n) => (
                <Link
                  key={n._id}
                  to={getNewsPath(n)}
                  className="hp-ticker-item"
                >
                  {n.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ========== SUB TRENDING STRIP - 3 RANDOM NEWS ========== */}
      {randomThree.length > 0 && (
        <section className="hp-quick-strip">
          <h3 className="hp-strip-title">🔥 Hot right now</h3>
          {randomThree.map((n) => (
            <Link key={n._id} to={getNewsPath(n)} className="hp-quick-card">
              <img src={n.image?.url || "/placeholder.jpg"} alt={n.title} />
              <div>
                <span className="hp-quick-tag">New</span>
                <h4>{n.title}</h4>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* ========== SPONSORED STRIP (horizontal) ========== */}
      {home.affiliateLinks?.length > 0 && (
        <section className="hp-ad-strip">
          <span className="hp-ad-label">Sponsored</span>
          <div className="hp-ad-scroll">
            {home.affiliateLinks.map((a, i) => (
              <a
                key={i}
                href={a.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hp-ad-card"
              >
                <div className="hp-ad-title">{a.title}</div>
                <span className="hp-ad-btn">{a.buttonText || "Visit"}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ========== LATEST NEWS - TOP 5 ========== */}
      <section className="hp-top-stories hp-relative">
        <span className="hp-float-label">Latest News</span>
        <div className="hp-top-grid">
          {latestNews.length === 0 ? (
            <p className="hp-empty">No stories yet.</p>
          ) : (
            latestNews.map((n, idx) => (
              <article key={n._id} className="hp-story-card" style={{ animationDelay: `${idx * 0.07}s` }}>
                <Link to={getNewsPath(n)}>
                  <div className="hp-story-img-wrap">
                    <img
                      src={n.image?.url || "/placeholder.jpg"}
                      alt={n.title}
                    />
                  </div>
                  <div className="hp-story-body">
                    <span className="hp-story-meta">
                      {n.category?.name} ·{" "}
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                    <h4>{n.title}</h4>
                    <span className="hp-story-link">Read →</span>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      </section>

      {/* ========== EDITOR'S PICKS - LATEST 10 NEWS ========== */}
      {editorsPicks.length > 0 && (
        <section className="hp-editors">
          <h2 className="hp-editors-title">Editor's Picks</h2>
          <p className="hp-editors-desc">Latest handpicked stories.</p>
          <div className="hp-editors-scroll">
            {editorsPicks.map((n) => (
              <Link
                key={n._id}
                to={getNewsPath(n)}
                className="hp-edit-card"
              >
                <img
                  src={n.image?.url || "/placeholder.jpg"}
                  alt={n.title}
                />
                <span className="hp-edit-title">{n.title}</span>
                <span className="hp-edit-meta">
                  {n.category?.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ========== CATEGORY SECTIONS ========== */}
      {home.categorySections?.map((sec, i) => (
        <section key={i} className="hp-category">
          <h2 className="hp-category-title">{sec.category?.name}</h2>
          <div className="hp-category-wrap">
            <div className="hp-category-main">
              <Link to={getNewsPath(sec.trending)}>
                <div className="hp-category-img-wrap">
                  <img
                    src={sec.trending?.image?.url || "/placeholder.jpg"}
                    alt={sec.trending?.title}
                  />
                </div>
                <h3>{sec.trending?.title}</h3>
                <p>{sec.trending?.summary || sec.trending?.description}</p>
                <span className="hp-category-read">Read →</span>
              </Link>
            </div>
            <div className="hp-category-list hp-relative">
              <span className="hp-float-mini">
                More from {sec.category?.name}
              </span>
              {(sec.subTrending || []).map((n) => (
                <Link
                  key={n._id}
                  to={getNewsPath(n)}
                  className="hp-category-item"
                >
                  <img
                    src={n.image?.url || "/placeholder.jpg"}
                    alt={n.title}
                  />
                  <span>{n.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ========== SPONSORED GRID ========== */}
      {home.affiliateLinks?.length > 0 && (
        <section className="hp-sponsored">
          <h2 className="hp-sponsored-title">Sponsored</h2>
          <div className="hp-sponsored-grid">
            {home.affiliateLinks.map((a, i) => (
              <a
                key={i}
                href={a.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hp-sponsored-card"
              >
                <span className="hp-sponsored-badge">Ad</span>
                <h4>{a.title}</h4>
                <span className="hp-sponsored-btn">
                  {a.buttonText || "Visit"}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ========== LATEST NEWS TICKER ========== */}
      {(home.latestNews?.length > 0 || latestSorted.length > 0) && (
        <section className="hp-ticker">
          <div className="hp-ticker-label">Latest</div>
          <div className="hp-ticker-wrap">
            <div className="hp-ticker-track">
              {(home.latestNews || latestSorted).slice(0, 8).map((n) => (
                <Link
                  key={n._id}
                  to={getNewsPath(n)}
                  className="hp-ticker-item"
                >
                  {n.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== NEWSLETTER ========== */}
      <section className="hp-newsletter">
        <h3>Get the best of Tech — weekly</h3>
        <p>No spam. Only quality stories.</p>
        <form className="hp-newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Enter your email"
            aria-label="Email"
          />
          <button type="submit">Subscribe</button>
        </form>
      </section>
    </div>
  );
};

export default Home;

