
// // // src/pages/news/NewsPage.jsx
// // import { useEffect, useState } from "react";
// // import { useParams, Link } from "react-router-dom";
// // import api from "../../api/axios";
// // import "./NewsPage.css";

// // const NewsPage = () => {
// //   const { id } = useParams();
// //   const [news, setNews] = useState(null);
// //   const [recommendations, setRecommendations] = useState([]);

// //   useEffect(() => {
// //     const fetchNews = async () => {
// //       try {
// //         const res = await api.get(`/news/${id}`);
// //         setNews(res.data);

// //         // Load recommendations (same category, exclude current)
// //         if (res.data.category?._id) {
// //           const recRes = await api.get(
// //             `/news?category=${res.data.category._id}&limit=5`
// //           );
// //           setRecommendations(recRes.data.filter((n) => n._id !== id));
// //         }
// //       } catch (err) {
// //         console.error("Failed to load news:", err);
// //       }
// //     };
// //     fetchNews();
// //   }, [id]);

// //   if (!news) return <p className="loading-text">Loading...</p>;

// //   return (
// //     <div className="news-page">

// //       {/* ================= HERO ================= */}
// //       <section className="news-hero">
// //         <div className="hero-image-wrapper">
// //           <img
// //             src={news.image?.url || "/placeholder.jpg"}
// //             alt={news.title}
// //             className="hero-image"
// //           />
// //         </div>
// //         <div className="hero-text">
// //           {news.isSponsored && <span className="badge">Sponsored</span>}
// //           <h1>{news.title}</h1>
// //           {news.subtitle && <h3>{news.subtitle}</h3>}
// //           <p>{news.description}</p>
// //           {news.externalLink && (
// //             <a
// //               href={news.externalLink}
// //               target="_blank"
// //               rel="noopener noreferrer"
// //               className="btn-readmore"
// //             >
// //               Read More →
// //             </a>
// //           )}
// //         </div>
// //       </section>

// //       {/* ================= CONTENT BLOCKS ================= */}
// //       <section className="news-content">
// //         {news.contentBlocks?.map((b, i) => {
// //           switch (b.type) {
// //             case "text":
// //               return <p key={i} className="content-text">{b.value}</p>;
// //             case "image":
// //               return (
// //                 <img
// //                   key={i}
// //                   src={b.value}
// //                   alt={`content-${i}`}
// //                   className="content-img"
// //                 />
// //               );
// //             case "link":
// //               return (
// //                 <a
// //                   key={i}
// //                   href={b.value}
// //                   target="_blank"
// //                   rel="noopener noreferrer"
// //                   className="content-link"
// //                 >
// //                   {b.value}
// //                 </a>
// //               );
// //             case "affiliate":
// //               return (
// //                 <div key={i} className="affiliate-inline">
// //                   <a href={b.value} target="_blank" rel="noopener noreferrer" className="btn-affiliate">
// //                     Buy Now
// //                   </a>
// //                 </div>
// //               );
// //             default:
// //               return null;
// //           }
// //         })}
// //       </section>

// //       {/* ================= AFFILIATE LINKS ================= */}
// //       {news.affiliateLinks?.length > 0 && (
// //         <section className="affiliate-section">
// //           <h3>Sponsored Links</h3>
// //           <div className="affiliate-grid">
// //             {news.affiliateLinks.map((a, i) => (
// //               <a
// //                 key={i}
// //                 href={a.link}
// //                 target="_blank"
// //                 rel="noopener noreferrer"
// //                 className="affiliate-card"
// //               >
// //                 <h4>{a.title}</h4>
// //                 <span>{a.buttonText || "Visit"}</span>
// //               </a>
// //             ))}
// //           </div>
// //         </section>
// //       )}

// //       {/* ================= RECOMMENDATIONS ================= */}
// //       {recommendations?.length > 0 && (
// //         <section className="recommendations">
// //           <h3>Recommended for You</h3>
// //           <div className="rec-grid">
// //             {recommendations.map((r) => (
// //               <Link to={`/news/${r._id}`} key={r._id} className="rec-card">
// //                 <img src={r.image?.url || "/placeholder.jpg"} alt={r.title} />
// //                 <h4>{r.title}</h4>
// //               </Link>
// //             ))}
// //           </div>
// //         </section>
// //       )}

// //       {/* ================= SEO INFO ================= */}
// //       <section className="seo-info">
// //         <p><strong>SEO Title:</strong> {news.seoTitle}</p>
// //         <p><strong>SEO Description:</strong> {news.seoDescription}</p>
// //         <p><strong>Keywords:</strong> {news.seoKeywords?.join(", ")}</p>
// //       </section>

// //       <Link to="/" className="btn-back">← Back to Home</Link>
// //     </div>
// //   );
// // };

// // export default NewsPage;

// // src/pages/news/NewsPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import "./NewsPage.css";

const NewsPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [progress, setProgress] = useState(0);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const fetchNews = async () => {
      const res = await api.get(`/news/${id}`);
      setNews(res.data);

      if (res.data.category?._id) {
        const rec = await api.get(`/news?category=${res.data.category._id}&limit=6`);
        setRecommendations(rec.data.filter(n => n._id !== id));
      }
    };
    fetchNews();
  }, [id]);

  /* ================= SCROLL PROGRESS ================= */
  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!news) return null;

  const readingTime = Math.ceil(
    (news.contentBlocks?.map(b => b.value).join(" ").split(" ").length || 200) / 200
  );

  return (
    <div className="news-wrapper">

      {/* ===== PROGRESS BAR ===== */}
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      {/* ===== SHARE BAR ===== */}
      <div className="share-bar">
        <a href={`https://wa.me/?text=${window.location.href}`} target="_blank">WA</a>
        <a href={`https://twitter.com/intent/tweet?url=${window.location.href}`} target="_blank">X</a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} target="_blank">IN</a>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="news-layout">

        {/* ===== ARTICLE ===== */}
        <article className="news-article">

          {/* HERO */}
          <header className="news-hero">
            {news.isSponsored && <span className="badge-sponsored">Sponsored</span>}
            <h1>{news.title}</h1>
            {news.subtitle && <h2>{news.subtitle}</h2>}

            <div className="meta">
              <span>By Admin</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>

            <img
              src={news.image?.url || "/placeholder.jpg"}
              alt={news.title}
              className="hero-image"
            />
          </header>

          {/* CONTENT */}
          <section className="news-content">
            {news.contentBlocks?.map((b, i) => {
              if (b.type === "text") return <p key={i}>{b.value}</p>;
              if (b.type === "image")
                return <img key={i} src={b.value} className="content-img" />;
              if (b.type === "link")
                return <a key={i} href={b.value} target="_blank">{b.value}</a>;
              return null;
            })}
          </section>

          {/* AFFILIATES */}
          {news.affiliateLinks?.length > 0 && (
            <section className="affiliate-section">
              <h3>Recommended Deals</h3>
              <div className="affiliate-grid">
                {news.affiliateLinks.map((a, i) => (
                  <a key={i} href={a.link} target="_blank" className="affiliate-card">
                    <h4>{a.title}</h4>
                    <span>{a.buttonText || "Check Offer →"}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* ===== SIDEBAR ===== */}
        {/* <aside className="news-sidebar">
          <h4>Trending</h4>
          {recommendations.slice(0, 4).map(r => (
            <Link key={r._id} to={`/news/${r._id}`} className="side-news">
              <img src={r.image?.url || "/placeholder.jpg"} />
              <span>{r.title}</span>
            </Link>
          ))}
        </aside> */}
<aside className="news-sidebar">
  <h4>Trending</h4>

  <div className="sidebar-scroll">
    {recommendations.map(r => (
      <Link key={r._id} to={`/news/${r._id}`} className="side-news">
        <img src={r.image?.url} alt={r.title} />
        <span>{r.title}</span>
      </Link>
    ))}
  </div>
</aside>


      </div>

      {/* ===== MORE NEWS ===== */}
      <section className="recommendations">
        <h3>More Stories</h3>
        <div className="rec-grid">
          {recommendations.map(r => (
            <Link key={r._id} to={`/news/${r._id}`} className="rec-card">
              <img src={r.image?.url || "/placeholder.jpg"} />
              <h4>{r.title}</h4>
            </Link>
          ))}
        </div>
      </section>

      <Link to="/" className="btn-back">← Back to Home</Link>
    </div>
  );
};

export default NewsPage;



