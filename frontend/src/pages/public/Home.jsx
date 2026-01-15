
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Home.css";

const Home = () => {
  const [home, setHome] = useState(null);

  const navigate = useNavigate(); 
  useEffect(() => {
    api
      .get("/homepage")
      .then((res) => setHome(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!home) return <p className="hp-loading">Loading...</p>;

  const handleSubscribe = (e) => {
    e.preventDefault(); // form submit rok do
    navigate("/contact"); // redirect to /contact
  };
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
          {/* <div className="hp-hero-actions">
            <a
              href={`/news/${home.mainTrending._id}`}
              className="hp-hero-read"
            >
              Read full story →
            </a>

            <button className="hp-hero-icon">☆ Save</button>
            <button className="hp-hero-icon">↗ Share</button>
          </div> */}

{/* ACTIONS */}
<div className="hp-hero-actions">

  {/* Read full story */}
  <a
    href={`/news/${home.mainTrending._id}`}
    className="hp-hero-read"
  >
    Read full story →
  </a>

  {/* Bookmark / Save */}
  <button
    className="hp-hero-icon"
    onClick={() => alert("Added to favorites!")}
  >
    🔖 Favorite
  </button>

  {/* Share */}
  <div className="hp-hero-share">
    <button
      className="hp-hero-icon"
      onClick={() => {
        const url = window.location.href;
        const text = encodeURIComponent(home.mainTrending.title);
        const wa = `https://wa.me/?text=${text}%20${url}`;
        const tw = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        const ln = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        const choice = prompt(
          "Share via: \n1 = WhatsApp\n2 = Twitter\n3 = LinkedIn"
        );
        if (choice === "1") window.open(wa, "_blank");
        else if (choice === "2") window.open(tw, "_blank");
        else if (choice === "3") window.open(ln, "_blank");
      }}
    >
      ↗ Share
    </button>
  </div>

</div>



        </div>

<span className="hp-hero-float">
    Featured Article
  </span>

      </section>

{/* ================= NEW FILLER SECTION ================= */}
      {/* <section className="hp-quick-strip">

<h3 className="hp-strip-title">🔥 Sub Trending</h3>

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
      </section> */}


<section className="hp-quick-strip">
  <h3 className="hp-strip-title">🔥 Sub Trending</h3>

  {home.subTrending
    ?.slice() // original array safe rahe
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // latest first
    .slice(0, 3)
    .map((n) => (
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
      {/* <section className="hp-top-stories"> */}

<section className="hp-top-stories hp-relative">
  <span className="hp-float-label">Latest News</span>

  

        {home.subTrending?.map((n) => (
          <article key={n._id} className="hp-story-card">
            <img src={n.image?.url} alt={n.title} />
            <h4>{n.title}</h4>
            <a href={`/news/${n._id}`}>Read →</a>
          </article>
        ))}
      </section>

      {/* ================= EDITORS PICK ================= */}
      {/* <section className="hp-editors">
        <h2>Editor’s Picks</h2>

        <div className="hp-editors-grid">
          {home.subTrending?.slice(0, 4).map((n) => (
            <div key={n._id} className="hp-edit-card">
              <img src={n.image?.url} alt={n.title} />
              <span>{n.title}</span>
            </div>
          ))}
        </div>
      </section> */}

<section className="hp-editors">
  <h2>Editor’s Picks</h2>

  <div className="hp-editors-grid">
    {home.subTrending
      ?.slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)
      .map((n) => (
        <a
          key={n._id}
          href={`/news/${n._id}`}
          className="hp-edit-card"
        >
          <img src={n.image?.url} alt={n.title} />
          <span>{n.title}</span>
        </a>
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
            {/* <div className="hp-category-list"> */}

 
 <div className="hp-category-list hp-relative">
  <span className="hp-float-mini">
    More from {sec.category.name}
  </span>

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


{/* ================= LATEST NEWS TICKER ================= */}
{home.latestNews?.length > 0 && (
  <section className="hp-latest-ticker">
    <div className="hp-ticker-wrapper">
      <div className="hp-ticker-track">
        {home.latestNews.slice(0, 5).map((n) => (
          <a key={n._id} href={`/news/${n._id}`} className="hp-ticker-item">
            {n.title}
          </a>
        ))}
      </div>
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
