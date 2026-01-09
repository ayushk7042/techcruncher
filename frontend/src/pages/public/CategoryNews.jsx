
// // import { useEffect, useState } from "react";
// // import { useParams, Link } from "react-router-dom";
// // import api from "../../api/axios";
// // import "./CategoryNews.css";

// // const CategoryNews = () => {
// //   const { id } = useParams();
// //   const [category, setCategory] = useState(null);
// //   const [news, setNews] = useState([]);
// //   const [search, setSearch] = useState("");

// //   // Fetch category info & news
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         // Get all categories to find current category
// //         const catRes = await api.get("/category");
// //         const currentCat = catRes.data.find(c => c._id === id);
// //         setCategory(currentCat || { name: "Category" });

// //         // Get news in this category
// //         const newsRes = await api.get(`/news?category=${id}`);
// //         setNews(newsRes.data);
// //       } catch (err) {
// //         console.error(err);
// //       }
// //     };
// //     fetchData();
// //   }, [id]);

// //   const filteredNews = news.filter(n =>
// //     n.title.toLowerCase().includes(search.toLowerCase())
// //   );

// //   if (!category) return <p>Loading...</p>;

// //   return (
// //     <div className="category-news-wrapper">
// //       {/* Header */}
// //       <header className="category-header">
// //         <h1>{category.name}</h1>
// //         {category.description && <p>{category.description}</p>}
// //         <input
// //           type="text"
// //           placeholder="Search news in this category..."
// //           value={search}
// //           onChange={e => setSearch(e.target.value)}
// //           className="category-search"
// //         />
// //       </header>

// //       {/* News Grid */}
// //       <section className="category-news-grid">
// //         {filteredNews.length > 0 ? (
// //           filteredNews.map(n => (
// //             <div key={n._id} className="category-news-card">
// //               <Link to={`/news/${n._id}`} className="card-link">
// //                 <div className="card-image-wrapper">
// //                   <img src={n.image?.url || "/placeholder.jpg"} alt={n.title} />
// //                   {n.isSponsored && <span className="badge-sponsored">Sponsored</span>}
// //                 </div>
// //                 <div className="card-content">
// //                   <h3>{n.title}</h3>
// //                   <p>{n.subtitle || n.description?.slice(0, 100)}</p>
// //                 </div>
// //               </Link>

// //               {/* Affiliate Links / Ads */}
// //               {n.affiliateLinks?.length > 0 && (
// //                 <div className="affiliate-section">
// //                   {n.affiliateLinks.map((a, i) => (
// //                     <a key={i} href={a.link} target="_blank" className="affiliate-card">
// //                       <h4>{a.title}</h4>
// //                       <span>{a.buttonText || "Check Offer →"}</span>
// //                     </a>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           ))
// //         ) : (
// //           <p className="no-news">No news found in this category.</p>
// //         )}
// //       </section>
// //     </div>
// //   );
// // };

// // export default CategoryNews;




// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import api from "../../api/axios";
// import "./CategoryNews.css";

// const CategoryNews = () => {
//   const { categoryId } = useParams();

//   const [news, setNews] = useState([]);
//   const [category, setCategory] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!categoryId) return;

//     const loadNews = async () => {
//       try {
//         const res = await api.get(`/news/category/${categoryId}`);

//         const safeNews = Array.isArray(res?.data?.news)
//           ? res.data.news
//           : [];

//         setNews(safeNews);
//         setCategory(res?.data?.category || null);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load news");
//         setNews([]); // ✅ force array
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadNews();
//   }, [categoryId]);

//   if (loading) return <p className="loading">Loading...</p>;
//   if (error) return <p className="error">{error}</p>;

//   // ✅ ABSOLUTE SAFE
//   const safeNews = Array.isArray(news) ? news : [];
//   const topNews = safeNews.length ? safeNews[0] : null;
//   const restNews = safeNews.length > 1 ? safeNews.slice(1) : [];

//   if (!safeNews.length) {
//     return <p className="empty">No news found for this category.</p>;
//   }

//   return (
//     <div className="category-page">

//       {/* ===== HEADER ===== */}
//       <h1 className="category-title">{category?.name}</h1>
//       {category?.description && (
//         <p className="category-desc">{category.description}</p>
//       )}

//       {/* ===== TOP NEWS ===== */}
//       {topNews && (
//         <Link to={`/news/${topNews._id}`} className="top-news">
//           <img
//             src={topNews.image?.url || "/placeholder.jpg"}
//             alt={topNews.title}
//           />
//           <h2>{topNews.title}</h2>
//         </Link>
//       )}



//       {/* ===== NEWS LIST ===== */}
//       <div className="news-list">
//         {restNews.map((item, index) => (
//           <div key={item._id}>
//             <Link to={`/news/${item._id}`} className="news-row">
//               <img
//                 src={item.image?.url || "/placeholder.jpg"}
//                 alt={item.title}
//               />
//               <h3>{item.title}</h3>
//             </Link>

//             {(index + 1) % 3 === 0 && (
//               <div className="affiliate-ad">
//                 <img src="/ads/sample-ad.jpg" alt="Ad" />
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//     </div>
//   );
// };

// export default CategoryNews;




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
