


// // // src/pages/home/Home.jsx
// // import { useEffect, useState } from "react";
// // import api from "../../api/axios";
// // import "./Home.css";

// // const Home = () => {
// //   const [home, setHome] = useState(null);

// //   useEffect(() => {
// //     const fetchHome = async () => {
// //       try {
// //         const res = await api.get("/homepage");
// //         setHome(res.data);
// //       } catch (err) {
// //         console.error("Failed to load homepage:", err);
// //       }
// //     };
// //     fetchHome();
// //   }, []);

// //   if (!home) return <p>Loading...</p>;

// //   return (
// //     <div className="home">

// //       {/* ================= HERO SECTION ================= */}
// //       <section className="hero">
// //         <div className="hero-text">
// //           <span className="badge">Trending</span>
// //           <h1>{home.mainTrending.title}</h1>
// //           <p>{home.mainTrending.summary}</p>
// //           <a href={`/news/${home.mainTrending._id}`} className="btn">
// //             Read More →
// //           </a>
// //         </div>

// //         <div className="hero-image">
// //           <img
// //             src={home.mainTrending.image?.url || "/placeholder.jpg"}
// //             alt={home.mainTrending.title}
// //           />
// //         </div>
// //       </section>

// //       {/* ================= SUB TRENDING ================= */}
// //       <section className="sub-trending">
// //         {home.subTrending?.map((n) => (
// //           <div key={n._id} className="sub-card">
// //             <img src={n.image?.url || "/placeholder.jpg"} alt={n.title} />
// //             <h4>{n.title}</h4>
// //             <a href={`/news/${n._id}`} className="read-more">
// //               Read →
// //             </a>
// //           </div>
// //         ))}
// //       </section>

// //       {/* ================= CATEGORY SECTIONS ================= */}
// //       {home.categorySections?.map((sec, i) => (
// //         <section key={i} className="category-section">
// //           <h2>{sec.category.name}</h2>

// //           <div className="category-grid">
// //             <div className="category-main">
// //               <img
// //                 src={sec.trending.image?.url || "/placeholder.jpg"}
// //                 alt={sec.trending.title}
// //               />
// //               <h3>{sec.trending.title}</h3>
// //               <p>{sec.trending.summary}</p>
// //               <a href={`/news/${sec.trending._id}`} className="btn-sm">
// //                 Read More
// //               </a>
// //             </div>

// //             <div className="category-list">
// //               {sec.subTrending.map((n) => (
// //                 <div key={n._id} className="list-item">
// //                   <img src={n.image?.url || "/placeholder.jpg"} alt={n.title} />
// //                   <span>{n.title}</span>
// //                   <a href={`/news/${n._id}`} className="small-link">
// //                     Read →
// //                   </a>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </section>
// //       ))}

// //       {/* ================= SIDE/ AFFILIATE LINKS ================= */}
// //       <aside className="affiliate-links">
// //         <h3>Sponsored Links</h3>
// //         {home.affiliateLinks?.map((a, i) => (
// //           <a
// //             key={i}
// //             href={a.link}
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             className="affiliate-card"
// //           >
// //             <h4>{a.title}</h4>
// //             <span>{a.buttonText || "Visit"}</span>
// //           </a>
// //         ))}
// //       </aside>
// //     </div>
// //   );
// // };

// // export default Home;





// // src/pages/home/Home.jsx
// import { useEffect, useState } from "react";
// import api from "../../api/axios";
// import "./Home.css";

// const Home = () => {
//   const [home, setHome] = useState(null);

//   useEffect(() => {
//     api.get("/homepage")
//       .then(res => setHome(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   if (!home) return <p>Loading...</p>;

//   return (
//     <div className="hp-root">

//       {/* ================= HERO ================= */}
//       {/* <section className="hp-hero">
//         <div className="hp-hero-text">
//           <span className="hp-badge">Featured</span>
//           <h1>{home.mainTrending.title}</h1>
//           <p>{home.mainTrending.summary}</p>
//           <a href={`/news/${home.mainTrending._id}`} className="hp-btn">
//             Read Full Story →
//           </a>
//         </div>

//         <div className="hp-hero-img">
//           <img src={home.mainTrending.image?.url} alt="" />
//         </div>
//       </section> */}

//      {/* ============ MAIN TRENDING COMPACT ============ */}
// {/* <section className="hp-hero-compact">

//   <div className="hp-hero-compact-img">
//     <img
//       src={home.mainTrending.image?.url || "/placeholder.jpg"}
//       alt={home.mainTrending.title}
//     />
//   </div>

//   <div className="hp-hero-compact-content">
//     <span className="hp-hero-tag">Trending</span>

//     <h1 className="hp-hero-headline">
//       {home.mainTrending.title}
//     </h1>

//     <p className="hp-hero-desc">
//       {home.mainTrending.summary}
//     </p>

//     <a
//       href={`/news/${home.mainTrending._id}`}
//       className="hp-hero-link"
//     >
//       Read story →
//     </a>
//   </div>

// </section> */}

// <section className="hp-hero">

//   {/* IMAGE */}
//   <div className="hp-hero-media">
//     <img
//       src={home.mainTrending.image?.url || "/placeholder.jpg"}
//       alt={home.mainTrending.title}
//     />
//   </div>

//   {/* CONTENT */}
//   <div className="hp-hero-body">

//     {/* META */}
//     <div className="hp-hero-meta">
//       <span className="hp-hero-badge">Trending</span>

//       {home.mainTrending.isSponsored && (
//         <span className="hp-hero-sponsored">Sponsored</span>
//       )}

//       <span className="hp-hero-sep">•</span>

//       <span className="hp-hero-category">
//         {home.mainTrending.category?.name}
//       </span>
//     </div>

//     {/* TITLE */}
//     <h1 className="hp-hero-title">
//       {home.mainTrending.title}
//     </h1>

//     {/* SUB INFO */}
//     <div className="hp-hero-subinfo">
//       <span>By {home.mainTrending.author || "Editorial Team"}</span>
//       <span>•</span>
//       <span>
//         {new Date(home.mainTrending.createdAt).toLocaleDateString()}
//       </span>
//       <span>•</span>
//       <span>3 min read</span>
//     </div>

//     {/* DESCRIPTION */}
//     <p className="hp-hero-summary">
//       {home.mainTrending.summary}
//     </p>

//     {/* ACTIONS */}
//     <div className="hp-hero-actions">
//       <a
//         href={`/news/${home.mainTrending._id}`}
//         className="hp-hero-read"
//       >
//         Read full story →
//       </a>

//       <button className="hp-hero-icon">☆ Save</button>
//       <button className="hp-hero-icon">↗ Share</button>
//     </div>

//   </div>
// </section>


// {home.affiliateLinks?.length > 0 && (
//   <section className="hp-ad-strip">
//     <span className="hp-ad-label">Sponsored</span>

//     <div className="hp-ad-scroll">
//       {home.affiliateLinks.map((a, i) => (
//         <a
//           key={i}
//           href={a.link}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="hp-ad-card"
//         >
//           <div className="hp-ad-title">{a.title}</div>
//           <span className="hp-ad-btn">
//             {a.buttonText || "Visit"}
//           </span>
//         </a>
//       ))}
//     </div>
//   </section>
// )}



//       {/* ================= TOP STORIES ================= */}
//       <section className="hp-top-stories">
//         {home.subTrending?.map(n => (
//           <article key={n._id} className="hp-story-card">
//             <img src={n.image?.url} alt="" />
//             <h4>{n.title}</h4>
//             <a href={`/news/${n._id}`}>Read →</a>
//           </article>
//         ))}
//       </section>

//       {/* ================= EDITORS PICK ================= */}
//       <section className="hp-editors">
//         <h2>Editor’s Picks</h2>
//         <div className="hp-editors-grid">
//           {home.subTrending?.slice(0,4).map(n => (
//             <div key={n._id} className="hp-edit-card">
//               <img src={n.image?.url} alt="" />
//               <span>{n.title}</span>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ================= CATEGORY BLOCKS ================= */}
//       {home.categorySections?.map((sec, i) => (
//         <section key={i} className="hp-category">
//           <h2>{sec.category.name}</h2>

//           <div className="hp-category-wrap">
//             <div className="hp-category-main">
//               <img src={sec.trending.image?.url} alt="" />
//               <h3>{sec.trending.title}</h3>
//               <p>{sec.trending.summary}</p>
//             </div>

//             <div className="hp-category-list">
//               {sec.subTrending.map(n => (
//                 <a key={n._id} href={`/news/${n._id}`} className="hp-category-item">
//                   <img src={n.image?.url} alt="" />
//                   <span>{n.title}</span>
//                 </a>
//               ))}
//             </div>
//           </div>
//         </section>
//       ))}

//       {/* ================= SPONSORED ================= */}
//       <section className="hp-sponsored">
//         <h2>Sponsored</h2>
//         <div className="hp-sponsored-grid">
//           {home.affiliateLinks?.map((a,i) => (
//             <a key={i} href={a.link} className="hp-sponsored-card">
//               <span>Sponsored</span>
//               <h4>{a.title}</h4>
//               <button>{a.buttonText || "Visit"}</button>
//             </a>
//           ))}
//         </div>
//       </section>

//       {/* ================= NEWSLETTER ================= */}
//       <section className="hp-newsletter">
//         <h3>Get the best of Tech — weekly</h3>
//         <p>No spam. Only quality stories.</p>
//         <div>
//           <input placeholder="Enter email" />
//           <button>Subscribe</button>
//         </div>
//       </section>

//     </div>
//   );
// };

// export default Home;



import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Home.css";

const Home = () => {
  const [home, setHome] = useState(null);

  useEffect(() => {
    api
      .get("/homepage")
      .then((res) => setHome(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!home) return <p className="hp-loading">Loading...</p>;

  return (
    <div className="hp-root">

      {/* ================= MAIN HERO / TRENDING ================= */}
      <section className="hp-hero">

        {/* IMAGE */}
        <div className="hp-hero-media">
          <img
            src={home.mainTrending.image?.url || "/placeholder.jpg"}
            alt={home.mainTrending.title}
          />
        </div>

        {/* CONTENT */}
        <div className="hp-hero-body">

          {/* META */}
          <div className="hp-hero-meta">
            <span className="hp-hero-badge">Trending</span>

            {home.mainTrending.isSponsored && (
              <span className="hp-hero-sponsored">Sponsored</span>
            )}

            <span className="hp-hero-sep">•</span>

            <span className="hp-hero-category">
              {home.mainTrending.category?.name}
            </span>
          </div>

          {/* TITLE */}
          <h1 className="hp-hero-title">
            {home.mainTrending.title}
          </h1>

          {/* SUB INFO */}
          <div className="hp-hero-subinfo">
            <span>By {home.mainTrending.author || "Editorial Team"}</span>
            <span>•</span>
            <span>
              {new Date(home.mainTrending.createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>3 min read</span>
          </div>

          {/* DESCRIPTION */}
          <p className="hp-hero-summary">
            {home.mainTrending.summary}
          </p>

          {/* ACTIONS */}
          <div className="hp-hero-actions">
            <a
              href={`/news/${home.mainTrending._id}`}
              className="hp-hero-read"
            >
              Read full story →
            </a>

            <button className="hp-hero-icon">☆ Save</button>
            <button className="hp-hero-icon">↗ Share</button>
          </div>

        </div>
      </section>

{/* ================= NEW FILLER SECTION ================= */}
      <section className="hp-quick-strip">
        {home.subTrending?.slice(0, 3).map((n) => (
          <a
            key={n._id}
            href={`/news/${n._id}`}
            className="hp-quick-card"
          >
            <img src={n.image?.url || "/placeholder.jpg"} alt={n.title} />
            <div>
              <span className="hp-quick-tag">Hot</span>
              <h4>{n.title}</h4>
            </div>
          </a>
        ))}
      </section>


      {/* ================= AFFILIATE / AD STRIP ================= */}
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
                <span className="hp-ad-btn">
                  {a.buttonText || "Visit"}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ================= TOP STORIES ================= */}
      <section className="hp-top-stories">
        {home.subTrending?.map((n) => (
          <article key={n._id} className="hp-story-card">
            <img src={n.image?.url} alt={n.title} />
            <h4>{n.title}</h4>
            <a href={`/news/${n._id}`}>Read →</a>
          </article>
        ))}
      </section>

      {/* ================= EDITORS PICK ================= */}
      <section className="hp-editors">
        <h2>Editor’s Picks</h2>

        <div className="hp-editors-grid">
          {home.subTrending?.slice(0, 4).map((n) => (
            <div key={n._id} className="hp-edit-card">
              <img src={n.image?.url} alt={n.title} />
              <span>{n.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CATEGORY SECTIONS ================= */}
      {home.categorySections?.map((sec, i) => (
        <section key={i} className="hp-category">
          <h2>{sec.category.name}</h2>

          <div className="hp-category-wrap">

            {/* MAIN */}
            <div className="hp-category-main">
              <img src={sec.trending.image?.url} alt={sec.trending.title} />
              <h3>{sec.trending.title}</h3>
              <p>{sec.trending.summary}</p>
              <a href={`/news/${sec.trending._id}`}>Read →</a>
            </div>

            {/* LIST */}
            <div className="hp-category-list">
              {sec.subTrending.map((n) => (
                <a
                  key={n._id}
                  href={`/news/${n._id}`}
                  className="hp-category-item"
                >
                  <img src={n.image?.url} alt={n.title} />
                  <span>{n.title}</span>
                </a>
              ))}
            </div>

          </div>
        </section>
      ))}

      {/* ================= SPONSORED GRID ================= */}
      {home.affiliateLinks?.length > 0 && (
        <section className="hp-sponsored">
          <h2>Sponsored</h2>

          <div className="hp-sponsored-grid">
            {home.affiliateLinks.map((a, i) => (
              <a
                key={i}
                href={a.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hp-sponsored-card"
              >
                <span className="hp-sponsored-badge">Sponsored</span>
                <h4>{a.title}</h4>
                <button>{a.buttonText || "Visit"}</button>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ================= NEWSLETTER ================= */}
      <section className="hp-newsletter">
        <h3>Get the best of Tech — weekly</h3>
        <p>No spam. Only quality stories.</p>

        <div className="hp-newsletter-form">
          <input type="email" placeholder="Enter email" />
          <button>Subscribe</button>
        </div>
      </section>

    </div>
  );
};

export default Home;
