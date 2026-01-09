import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    api.get("/category").then(res => setCategories(res.data));
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      const res = await api.get(`/news?search=${search}`);
      setResults(res.data);
      setLoading(false);
    };

    const delay = setTimeout(fetch, 400);
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="tc-navbar">
        <div className="tc-left">
          <button
            className="tc-menu"
            onClick={() => setShowDrawer(true)}
          >
            ☰
          </button>




          <Link to="/" className="tc-logo">
            Tech<span>Cruncher</span>
          </Link>

          <div className="tc-categories">
            {categories.slice(0, 5).map(c => (
              <Link
                key={c._id}
                to={`/category/${c._id}`}
                className="tc-cat"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* SEARCH */}
        <div className="tc-search">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search news, topics, categories…"
          />

          {search && (
            <div className="tc-search-box">
              {loading && <p>Searching…</p>}

              {!loading && results.length === 0 && (
                <p>No results found</p>
              )}

              {results.map(n => (
                <div
                  key={n._id}
                  className="tc-search-item"
                  onClick={() => {
                    setSearch("");
                    navigate(`/news/${n._id}`);
                  }}
                >
                  <span>{n.title}</span>
                  <small>{n.category?.name}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ================= DRAWER ================= */}
      {showDrawer && (
        <div className="tc-drawer-overlay" onClick={() => setShowDrawer(false)}>
          <div
            className="tc-drawer"
            onClick={e => e.stopPropagation()}
          >
            <h3>All Categories</h3>

            {categories.map(c => (
              <Link
                key={c._id}
                to={`/category/${c._id}`}
                onClick={() => setShowDrawer(false)}
                className="tc-drawer-link"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
