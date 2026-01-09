
import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";
import "./HomepageManager.css";

const HomepageManager = () => {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mainTrending, setMainTrending] = useState("");
  const [subTrending, setSubTrending] = useState([]);
  const [categorySections, setCategorySections] = useState([]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [newsRes, catRes, homeRes] = await Promise.all([
        api.get("/news"),
        api.get("/category"), // ✅ FIXED
        api.get("/homepage")
      ]);

      setNews(newsRes.data);
      setCategories(catRes.data);

      if (homeRes.data) {
        setMainTrending(homeRes.data.mainTrending?._id || "");
        setSubTrending(homeRes.data.subTrending?.map(n => n._id) || []);

        setCategorySections(
          homeRes.data.categorySections?.map(sec => ({
            category: sec.category?._id || "",
            trending: sec.trending?._id || "",
            subTrending: sec.subTrending?.map(n => n._id) || []
          })) || []
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load homepage data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUB TRENDING ================= */
  const toggleSubTrending = (id) => {
    setSubTrending(prev => {
      if (prev.includes(id)) {
        return prev.filter(n => n !== id);
      }
      if (prev.length >= 5) {
        alert("Max 5 sub trending allowed");
        return prev;
      }
      return [...prev, id];
    });
  };

  /* ================= CATEGORY SECTION ================= */
  const addCategorySection = () => {
    setCategorySections(prev => [
      ...prev,
      { category: "", trending: "", subTrending: [] }
    ]);
  };

  const updateCategorySection = (index, field, value) => {
    setCategorySections(prev =>
      prev.map((sec, i) =>
        i === index ? { ...sec, [field]: value } : sec
      )
    );
  };

  const toggleCategorySub = (index, id) => {
    setCategorySections(prev =>
      prev.map((sec, i) => {
        if (i !== index) return sec;

        const exists = sec.subTrending.includes(id);
        if (!exists && sec.subTrending.length >= 5) {
          alert("Max 5 sub trending allowed per category");
          return sec;
        }

        return {
          ...sec,
          subTrending: exists
            ? sec.subTrending.filter(n => n !== id)
            : [...sec.subTrending, id]
        };
      })
    );
  };

  const removeCategorySection = (index) => {
    setCategorySections(prev => prev.filter((_, i) => i !== index));
  };

  /* ================= SAVE ================= */
  const saveHomepage = async () => {
    if (!mainTrending) {
      return alert("Main trending is required");
    }

    for (const sec of categorySections) {
      if (!sec.category || !sec.trending) {
        return alert("Each category section needs category + trending");
      }
    }

    try {
      await api.post("/homepage", {
        mainTrending,
        subTrending,
        categorySections,
        customHomeBlocks: []
      });

      alert("Homepage updated successfully");
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Save failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-header">
          <h2>Homepage Manager</h2>
          <button className="btn" onClick={saveHomepage}>
            Save Homepage
          </button>
        </div>

        <div className="admin-form">
          {/* MAIN TRENDING */}
          <h4>Main Trending</h4>
          <select
            value={mainTrending}
            onChange={(e) => setMainTrending(e.target.value)}
          >
            <option value="">Select News</option>
            {news.map(n => (
              <option key={n._id} value={n._id}>
                {n.title}
              </option>
            ))}
          </select>

          {/* SUB TRENDING */}
          <h4>Sub Trending (Max 5)</h4>
          <div className="checkbox-grid">
            {news.map(n => (
              <label key={n._id}>
                <input
                  type="checkbox"
                  checked={subTrending.includes(n._id)}
                  onChange={() => toggleSubTrending(n._id)}
                />
                {n.title}
              </label>
            ))}
          </div>

          {/* CATEGORY SECTIONS */}
          <h4>Category Sections</h4>

          {categorySections.map((sec, index) => (
            <div
              key={index}
              className="category-box"
            >
              <select
                value={sec.category}
                onChange={(e) =>
                  updateCategorySection(index, "category", e.target.value)
                }
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={sec.trending}
                onChange={(e) =>
                  updateCategorySection(index, "trending", e.target.value)
                }
              >
                <option value="">Category Trending</option>
                {news.map(n => (
                  <option key={n._id} value={n._id}>
                    {n.title}
                  </option>
                ))}
              </select>

              <h5>Sub Trending (Max 5)</h5>
              <div className="checkbox-grid">
                {news.map(n => (
                  <label key={n._id}>
                    <input
                      type="checkbox"
                      checked={sec.subTrending.includes(n._id)}
                      onChange={() => toggleCategorySub(index, n._id)}
                    />
                    {n.title}
                  </label>
                ))}
              </div>

              <button
                className="btn-sm danger"
                onClick={() => removeCategorySection(index)}
              >
                Remove Section
              </button>
            </div>
          ))}

          <button type="button" onClick={addCategorySection}>
            + Add Category Section
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HomepageManager;
