

// src/pages/admin/AddEditNews.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import "./AddEditNews.css";

/* 🔒 NEVER use shared object reference */
const createEmptyBlock = () => ({
  type: "text",
  value: ""
});

const createEmptyAffiliate = () => ({
  title: "",
  link: "",
  buttonText: ""
});

const AddEditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",

    imageUrl: "",
    externalLink: "",
    adsLink: "",
    status: "published",

    isMainTrending: false,
    isSubTrending: false,
    homeOrder: 0,
    isCategoryTrending: false,
    isCategorySubTrending: false,

    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",

    isSponsored: false,

    contentBlocks: [createEmptyBlock()],
    affiliateLinks: []
  });

  useEffect(() => {
    loadCategories();
    if (id) loadNews();
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const loadNews = async () => {
    try {
      const res = await api.get(`/news/${id}`);
      const n = res.data;

      setForm({
        title: n.title,
        subtitle: n.subtitle || "",
        description: n.description,
        category: n.category?._id || "",

        imageUrl: n.image?.url || "",
        externalLink: n.externalLink || "",
        adsLink: n.adsLink || "",
        status: n.status,

        isSponsored: n.isSponsored,
        isMainTrending: n.isMainTrending,
        isSubTrending: n.isSubTrending,
        homeOrder: n.homeOrder || 0,
        isCategoryTrending: n.isCategoryTrending,
        isCategorySubTrending: n.isCategorySubTrending,

        seoTitle: n.seoTitle || "",
        seoDescription: n.seoDescription || "",
        seoKeywords: (n.seoKeywords || []).join(","),

        contentBlocks: n.contentBlocks?.length
          ? n.contentBlocks.map(b => ({ ...b }))
          : [createEmptyBlock()],

        affiliateLinks: n.affiliateLinks?.length
          ? n.affiliateLinks.map(a => ({ ...a }))
          : []
      });
    } catch (err) {
      console.error("Failed to load news", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  /* ---------- CONTENT BLOCKS ---------- */
  const updateBlock = (i, key, val) => {
    const blocks = [...form.contentBlocks];
    blocks[i] = { ...blocks[i], [key]: val };
    setForm({ ...form, contentBlocks: blocks });
  };

  const addBlock = () =>
    setForm({
      ...form,
      contentBlocks: [...form.contentBlocks, createEmptyBlock()]
    });

  const removeBlock = (i) =>
    setForm({
      ...form,
      contentBlocks: form.contentBlocks.filter((_, idx) => idx !== i)
    });

  /* ---------- AFFILIATES ---------- */
  const updateAffiliate = (i, key, val) => {
    const links = [...form.affiliateLinks];
    links[i] = { ...links[i], [key]: val };
    setForm({ ...form, affiliateLinks: links });
  };

  const addAffiliate = () =>
    setForm({
      ...form,
      affiliateLinks: [...form.affiliateLinks, createEmptyAffiliate()]
    });

  const removeAffiliate = (i) =>
    setForm({
      ...form,
      affiliateLinks: form.affiliateLinks.filter((_, idx) => idx !== i)
    });

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      seoKeywords: form.seoKeywords
        .split(",")
        .map(k => k.trim())
        .filter(Boolean),
      image: form.imageUrl ? { url: form.imageUrl } : undefined
    };

    try {
      if (id) {
        await api.put(`/news/${id}`, payload);
      } else {
        await api.post("/news", payload);
      }
      navigate("/admin/news");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>{id ? "Edit News" : "Add News"}</h2>
        <Link to="/admin/dashboard" className="btn secondary">
          ← Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {/* BASIC INFO */}
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
        <input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Subtitle" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short Description" rows="4" required />

        {/* IMAGE & LINKS */}
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="Image URL" />
        <input name="externalLink" value={form.externalLink} onChange={handleChange} placeholder="External Link" />
        <input name="adsLink" value={form.adsLink} onChange={handleChange} placeholder="Ads Link / Banner URL" />

        {/* CATEGORY */}
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* CONTENT BLOCKS */}
        <h4>Content Blocks</h4>
        {form.contentBlocks.map((b, i) => (
          <div key={i} className="block-row">
            <select value={b.type} onChange={e => updateBlock(i, "type", e.target.value)}>
              <option value="text">Text</option>
              <option value="link">Link</option>
              <option value="image">Image</option>
              <option value="affiliate">Affiliate</option>
            </select>
            <input value={b.value} onChange={e => updateBlock(i, "value", e.target.value)} placeholder="Block Value" />
            <button type="button" onClick={() => removeBlock(i)}>✕</button>
          </div>
        ))}
        <button type="button" onClick={addBlock}>+ Add Block</button>

        {/* AFFILIATE LINKS */}
        <h4>Affiliate Links</h4>
        {form.affiliateLinks.map((a, i) => (
          <div key={i} className="block-row">
            <input placeholder="Title" value={a.title} onChange={e => updateAffiliate(i, "title", e.target.value)} />
            <input placeholder="Link" value={a.link} onChange={e => updateAffiliate(i, "link", e.target.value)} />
            <input placeholder="Button Text" value={a.buttonText} onChange={e => updateAffiliate(i, "buttonText", e.target.value)} />
            <button type="button" onClick={() => removeAffiliate(i)}>✕</button>
          </div>
        ))}
        <button type="button" onClick={addAffiliate}>+ Add Affiliate</button>

        {/* SEO */}
        <h4>SEO</h4>
        <input name="seoTitle" value={form.seoTitle} onChange={handleChange} placeholder="SEO Title" />
        <textarea name="seoDescription" value={form.seoDescription} onChange={handleChange} placeholder="SEO Description" />
        <input name="seoKeywords" value={form.seoKeywords} onChange={handleChange} placeholder="keywords,comma,separated" />

        {/* FLAGS */}
        <label><input type="checkbox" name="isSponsored" checked={form.isSponsored} onChange={handleChange} /> Sponsored</label>
        <label><input type="checkbox" name="isMainTrending" checked={form.isMainTrending} onChange={handleChange} /> Main Trending</label>
        <label><input type="checkbox" name="isSubTrending" checked={form.isSubTrending} onChange={handleChange} /> Sub Trending</label>
        <label><input type="checkbox" name="isCategoryTrending" checked={form.isCategoryTrending} onChange={handleChange} /> Category Trending</label>
        <label><input type="checkbox" name="isCategorySubTrending" checked={form.isCategorySubTrending} onChange={handleChange} /> Category Sub Trending</label>

        {/* STATUS */}
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button type="submit" className="btn">Save News</button>
      </form>
    </div>
  );
};

export default AddEditNews;
