import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Navbar.css";
import { getNewsPath } from "../utils/newsUrl";

const Navbar = () => {
  const navigate = useNavigate();
  const moreButtonRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [moreMenuStyle, setMoreMenuStyle] = useState({});
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    api.get("/category").then(res => setCategories(res.data));
  }, []);

  /* ================= CLOSE DROPDOWN ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMoreCategories && moreButtonRef.current && !moreButtonRef.current.contains(e.target)) {
        const menu = document.querySelector('.nb-more-menu');
        if (menu && !menu.contains(e.target)) {
          setShowMoreCategories(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMoreCategories]);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      setFocusedIndex(-1);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get("/news");
        const allNews = res.data;

        const filtered = allNews
          .map(n => {
            let score = 0;
            const query = search.toLowerCase();
            if (n.title.toLowerCase().includes(query)) score += 2;
            if (n.category?.name.toLowerCase().includes(query)) score += 1;
            return { ...n, score };
          })
          .filter(n => n.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);

        setResults(filtered);
      } catch (err) {
        console.error("Search failed", err);
        setResults([]);
      }
      setLoading(false);
    };

    const delay = setTimeout(fetch, 400);
    return () => clearTimeout(delay);
  }, [search]);

  const handleSearchItemClick = (item) => {
    setSearch("");
    setFocusedIndex(-1);
    navigate(getNewsPath(item));
  };

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="nb-navbar">
        <div className="nb-container">
          {/* LEFT: Logo + Menu */}
          <div className="nb-left">
            <button
              className="nb-menu-btn"
              onClick={() => setShowDrawer(true)}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link to="/" className="nb-logo">
              <span className="nb-logo-text">Tech</span><span className="nb-logo-accent">Cruncher</span>
            </Link>
          </div>

          {/* CENTER: Categories */}
          <div className="nb-categories">
            {categories.slice(0, 5).map(c => (
              <Link
                key={c._id}
                to={`/category/${c._id}`}
                className="nb-category-link"
              >
                {c.name}
              </Link>
            ))}

            {/* More Categories Dropdown */}
            {categories.length > 5 && (
              <div className={`nb-more-wrapper ${showMoreCategories ? 'active' : ''}`}>
                <button
                  ref={moreButtonRef}
                  className="nb-more-btn"
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                  aria-label="More categories"
                  aria-expanded={showMoreCategories}
                >
                  More
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showMoreCategories && (
                  <div className="nb-more-menu" style={moreMenuStyle}>
                    {categories.slice(5).map(c => (
                      <Link
                        key={c._id}
                        to={`/category/${c._id}`}
                        className="nb-more-link"
                        onClick={() => setShowMoreCategories(false)}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Search */}
          <div className="nb-search-wrapper">
            <div className="nb-search">
              <svg className="nb-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="nb-search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stories…"
                aria-label="Search"
              />
              {search && <span className="nb-search-clear" onClick={() => setSearch("")}>✕</span>}
            </div>

            {/* Search Results Dropdown */}
            {search && (
              <div className="nb-search-results">
                {loading && (
                  <div className="nb-search-loading">
                    <div className="nb-spinner" />
                    <p>Searching…</p>
                  </div>
                )}

                {!loading && results.length === 0 && (
                  <div className="nb-search-empty">
                    <p>No results found for "{search}"</p>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="nb-results-list">
                    {results.map((n, idx) => (
                      <div
                        key={n._id}
                        className={`nb-result-item ${focusedIndex === idx ? 'active' : ''}`}
                        onClick={() => handleSearchItemClick(n)}
                      >
                        <div className="nb-result-img">
                          <img src={n.image?.url || "/placeholder.jpg"} alt={n.title} />
                        </div>
                        <div className="nb-result-content">
                          <span className="nb-result-category">{n.category?.name}</span>
                          <h4 className="nb-result-title">{n.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ================= DRAWER (Mobile Menu) ================= */}
      {showDrawer && (
        <div className="nb-drawer-overlay" onClick={closeDrawer}>
          <div
            className="nb-drawer"
            onClick={e => e.stopPropagation()}
          >
            <div className="nb-drawer-header">
              <h3>Menu</h3>
              <button className="nb-drawer-close" onClick={closeDrawer}>✕</button>
            </div>

            <div className="nb-drawer-categories">
              <p className="nb-drawer-label">All Categories</p>
              {categories.map(c => (
                <Link
                  key={c._id}
                  to={`/category/${c._id}`}
                  onClick={closeDrawer}
                  className="nb-drawer-link"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
