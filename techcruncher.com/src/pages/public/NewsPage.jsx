// // src/pages/public/NewsPage.jsx
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import api from "../../api/axios";
// import "./N.css";

// const NewsPage = () => {
//   const { id } = useParams();
//   const [news, setNews] = useState(null);
//   const [recommendations, setRecommendations] = useState([]);
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     const fetchNews = async () => {
//       try {
//         const res = await api.get(`/news/${id}`);
//         setNews(res.data);

//         if (res.data.category?._id) {
//           const rec = await api.get(`/news?category=${res.data.category._id}&limit=6`);
//           setRecommendations(rec.data.filter((n) => n._id !== id));
//         }
//       } catch (err) {
//         console.error("Failed to load news", err);
//       }
//     };
//     fetchNews();
//   }, [id]);

//   /* SEO: document title */
//   useEffect(() => {
//     if (news?.seoTitle) document.title = news.seoTitle;
//     return () => { document.title = "Techcruncher"; };
//   }, [news?.seoTitle]);

//   useEffect(() => {
//     const onScroll = () => {
//       const total = document.body.scrollHeight - window.innerHeight;
//       setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
//     };
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   if (!news) return null;

//   const wordCount = news.contentBlocks?.map((b) => b.value).join(" ").split(/\s+/).filter(Boolean).length || 0;
//   const readingTime = Math.max(1, Math.ceil(wordCount / 200));

//   const shareUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
//   const shareTitle = encodeURIComponent(news.title || "");

//   return (
//     <div className="news-wrapper">
//       <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

//       <div className="share-bar-vertical" aria-label="Share">
//         <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">WA</a>
//         <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">X</a>
//         <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">IN</a>
//       </div>

//       <div className="news-layout">
//         <article className="news-article">
//           <header className="news-hero">
//             <div className="news-hero-badges">
//               {news.category?.name && (
//                 <Link to={`/category/${news.category._id}`} className="badge badge-category">
//                   {news.category.name}
//                 </Link>
//               )}
//               {news.isSponsored && <span className="badge badge-sponsored">Sponsored</span>}
//               {news.isMainTrending && <span className="badge badge-trending">Trending</span>}
//               {news.isSubTrending && <span className="badge badge-sub-trending">Sub Trending</span>}
//               {news.isCategoryTrending && <span className="badge badge-cat-trending">Category Trending</span>}
//               {news.isCategorySubTrending && <span className="badge badge-cat-sub">Category Sub</span>}
//             </div>

//             <h1 className="news-title">{news.title}</h1>
//             {news.subtitle && <h2 className="news-subtitle">{news.subtitle}</h2>}

//             {news.description && (
//               <p className="news-description">{news.description}</p>
//             )}

//             <div className="news-meta">
//               <span>By Admin</span>
//               <span className="meta-dot">·</span>
//               <span>{readingTime} min read</span>
//             </div>

//             {news.image?.url && (
//               <figure className="hero-figure">
//                 <img
//                   src={news.image.url}
//                   alt={news.title}
//                   className="hero-image"
//                 />
//               </figure>
//             )}
//           </header>

//           <section className="news-content">
//             {news.contentBlocks?.map((b, i) => {
//               if (b.type === "text" && b.value) return <p key={i} className="content-text">{b.value}</p>;
//               if (b.type === "image" && b.value) return <figure key={i} className="content-figure"><img src={b.value} className="content-img" alt={`Content ${i + 1}`} /></figure>;
//               if (b.type === "link" && b.value) return <p key={i} className="content-link-wrap"><a href={b.value} target="_blank" rel="noopener noreferrer" className="content-link">{b.value}</a></p>;
//               if (b.type === "affiliate" && news.affiliateLinks?.length > 0) {
//                 const aff = news.affiliateLinks.find((a) => a.link === b.value) || news.affiliateLinks[i % news.affiliateLinks.length];
//                 return aff ? (
//                   <a key={i} href={aff.link} target="_blank" rel="noopener noreferrer" className="affiliate-inline">
//                     {aff.title} → {aff.buttonText || "Check Offer"}
//                   </a>
//                 ) : null;
//               }
//               return null;
//             })}

//             {news.externalLink && (
//               <div className="external-link-box">
//                 <p className="external-link-label">Read more</p>
//                 <a href={news.externalLink} target="_blank" rel="noopener noreferrer" className="external-link">
//                   {news.externalLink}
//                 </a>
//               </div>
//             )}

//             {news.adsLink && (
//               <div className="ads-banner">
//                 <a href={news.adsLink} target="_blank" rel="noopener noreferrer">
//                   <img src={news.adsLink} alt="Advertisement" />
//                 </a>
//               </div>
//             )}
//           </section>

//           {news.affiliateLinks?.length > 0 && (
//             <section className="affiliate-section" aria-labelledby="affiliate-heading">
//               <h3 id="affiliate-heading" className="affiliate-heading">Recommended Deals</h3>
//               <div className="affiliate-grid">
//                 {news.affiliateLinks.map((a, i) => (
//                   <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" className="affiliate-card">
//                     <h4>{a.title}</h4>
//                     <span className="affiliate-cta">{a.buttonText || "Check Offer →"}</span>
//                   </a>
//                 ))}
//               </div>
//             </section>
//           )}
//         </article>

//         <aside className="news-sidebar" aria-label="Related stories">
//           <h4 className="sidebar-heading">Trending</h4>
//           <div className="sidebar-scroll">
//             {recommendations.length === 0 ? (
//               <p className="sidebar-empty">No related stories yet.</p>
//             ) : (
//               recommendations.map((r) => (
//                 <Link key={r._id} to={`/news/${r._id}`} className="side-news">
//                   <img src={r.image?.url || "/placeholder.jpg"} alt="" />
//                   <span>{r.title}</span>
//                 </Link>
//               ))
//             )}
//           </div>
//         </aside>
//       </div>

//       <section className="recommendations" aria-labelledby="more-heading">
//         <h3 id="more-heading" className="recommendations-heading">More Stories</h3>
//         <div className="rec-grid">
//           {recommendations.map((r) => (
//             <Link key={r._id} to={`/news/${r._id}`} className="rec-card">
//               <img src={r.image?.url || "/placeholder.jpg"} alt="" />
//               <h4>{r.title}</h4>
//             </Link>
//           ))}
//         </div>
//       </section>

//       <div className="news-footer-actions">
//         <Link to="/" className="btn-back">← Back to Home</Link>
//       </div>
//     </div>
//   );
// };

// export default NewsPage;

// src/pages/public/NewsPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import "./N.css";
import { getNewsPath } from "../../utils/newsUrl";

const NewsPage = () => {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get(`/news/${slug}`);
        setNews(res.data);

        if (res.data.category?._id) {
          const rec = await api.get(`/news?category=${res.data.category._id}&limit=6`);
          setRecommendations(rec.data.filter((n) => n._id !== res.data._id));
        }
      } catch (err) {
        console.error("Failed to load news", err);
      }
    };
    fetchNews();
  }, [slug]);

  /* SEO: document title */
  useEffect(() => {
    if (news?.seoTitle) document.title = news.seoTitle;
    return () => { document.title = "Techcruncher"; };
  }, [news?.seoTitle]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!news) return null;

  const wordCount = news.contentBlocks?.map((b) => b.value).join(" ").split(/\s+/).filter(Boolean).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const shareUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const shareTitle = encodeURIComponent(news.title || "");

  return (
    <div className="news-wrapper">
      <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <div className="share-bar-vertical" aria-label="Share">
        <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">WA</a>
        <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">X</a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">IN</a>
      </div>

      <div className="news-layout">
        <article className="news-article">
          <header className="news-hero">
            <div className="news-hero-badges">
              {news.category?.name && (
                <Link to={`/category/${news.category._id}`} className="badge badge-category">
                  {news.category.name}
                </Link>
              )}
              {news.isSponsored && <span className="badge badge-sponsored">Sponsored</span>}
              {news.isMainTrending && <span className="badge badge-trending">Trending</span>}
              {news.isSubTrending && <span className="badge badge-sub-trending">Sub Trending</span>}
              {news.isCategoryTrending && <span className="badge badge-cat-trending">Category Trending</span>}
              {news.isCategorySubTrending && <span className="badge badge-cat-sub">Category Sub</span>}
            </div>

            <h1 className="news-title">{news.title}</h1>
            {news.subtitle && <h2 className="news-subtitle">{news.subtitle}</h2>}

            {news.description && (
              <p className="news-description">{news.description}</p>
            )}

            <div className="news-meta">
              <span>By Admin</span>
              <span className="meta-dot">·</span>
              <span>{readingTime} min read</span>
            </div>

            {news.image?.url && (
              <figure className="hero-figure">
                {news.imageRedirectUrl || news.imageRedirectLink || news.image_redirect_url ? (
                  <a href={news.imageRedirectUrl || news.imageRedirectLink || news.image_redirect_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={news.image.url}
                      alt={news.title}
                      className="hero-image"
                    />
                  </a>
                ) : (
                  <img
                    src={news.image.url}
                    alt={news.title}
                    className="hero-image"
                  />
                )}
              </figure>
            )}
          </header>

          <section className="news-content">
            {news.contentBlocks?.map((b, i) => {
              if (b.type === "text" && (b.heading || b.value)) {
                return (
                  <div key={i} className="content-block-text">
                    {b.heading && <h3 className="content-block-heading">{b.heading}</h3>}
                    {b.value && <p className="content-text">{b.value}</p>}
                  </div>
                );
              }
              if (b.type === "image" && b.value) return (
                <figure key={i} className="content-figure">
                  {b.redirectUrl || b.redirect_url || b.link_url ? (
                    <a href={b.redirectUrl || b.redirect_url || b.link_url} target="_blank" rel="noopener noreferrer">
                      <img src={b.value} className="content-img" alt={`Content ${i + 1}`} />
                    </a>
                  ) : (
                    <img src={b.value} className="content-img" alt={`Content ${i + 1}`} />
                  )}
                </figure>
              );
              if (b.type === "link" && b.value) return <p key={i} className="content-link-wrap"><a href={b.value} target="_blank" rel="noopener noreferrer" className="content-link">{b.value}</a></p>;
              if (b.type === "affiliate" && news.affiliateLinks?.length > 0) {
                const aff = news.affiliateLinks.find((a) => a.link === b.value) || news.affiliateLinks[i % news.affiliateLinks.length];
                return aff ? (
                  <a key={i} href={aff.link} target="_blank" rel="noopener noreferrer" className="affiliate-inline">
                    {aff.title} → {aff.buttonText || "Check Offer"}
                  </a>
                ) : null;
              }
              return null;
            })}

            {news.externalLink && (
              <div className="external-link-box">
                <p className="external-link-label">Read more</p>
                <a href={news.externalLink} target="_blank" rel="noopener noreferrer" className="external-link">
                  {news.externalLink}
                </a>
              </div>
            )}

            {news.adsLink && (
              <div className="ads-banner">
                <a href={news.adsLink} target="_blank" rel="noopener noreferrer">
                  <img src={news.adsLink} alt="Advertisement" />
                </a>
              </div>
            )}
          </section>

          {news.affiliateLinks?.length > 0 && (
            <section className="affiliate-section" aria-labelledby="affiliate-heading">
              <h3 id="affiliate-heading" className="affiliate-heading">Recommended Deals</h3>
              <div className="affiliate-grid">
                {news.affiliateLinks.map((a, i) => (
                  <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" className="affiliate-card">
                    <h4>{a.title}</h4>
                    <span className="affiliate-cta">{a.buttonText || "Check Offer →"}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="news-sidebar" aria-label="Related stories">
          <h4 className="sidebar-heading">Trending</h4>
          <div className="sidebar-scroll">
            {recommendations.length === 0 ? (
              <p className="sidebar-empty">No related stories yet.</p>
            ) : (
              recommendations.map((r) => (
                <Link key={r._id} to={getNewsPath(r)} className="side-news">
                  <img src={r.image?.url || "/placeholder.jpg"} alt="" />
                  <span>{r.title}</span>
                </Link>
              ))
            )}
          </div>
        </aside>
      </div>

      <section className="recommendations" aria-labelledby="more-heading">
        <h3 id="more-heading" className="recommendations-heading">More Stories</h3>
        <div className="rec-grid">
          {recommendations.map((r) => (
            <Link key={r._id} to={getNewsPath(r)} className="rec-card">
              <img src={r.image?.url || "/placeholder.jpg"} alt="" />
              <h4>{r.title}</h4>
            </Link>
          ))}
        </div>
      </section>

      <div className="news-footer-actions">
        <Link to="/" className="btn-back">← Back to Home</Link>
      </div>
    </div>
  );
};

export default NewsPage;