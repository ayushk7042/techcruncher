// import { Link } from "react-router-dom";
// import "./Footer.css";

// const Footer = ({ categories = [], recentNews = [], topCategories = [] }) => {
//   return (
//     <footer className="footer">

//       {/* ===== FOOTER TOP ===== */}
//       <div className="footer-top">

//         {/* ===== BRAND / ABOUT ===== */}
//         <div className="footer-section footer-brand">
//           <h2>Tech<span>News</span></h2>
//           <p>Your ultimate source for technology news, reviews, and insights.</p>
//         </div>

//         {/* ===== QUICK LINKS ===== */}
//         <div className="footer-section footer-links">
//           <h4>Quick Links</h4>
//           <ul>
//             <li><Link to="/">Home</Link></li>
//             <li><Link to="/about">About</Link></li>
//             {categories.map(c => (
//               <li key={c._id}><Link to={`/category/${c._id}`}>{c.name}</Link></li>
//             ))}
//             <li><Link to="/contact">Contact</Link></li>
//             <li><Link to="/privacy">Privacy Policy</Link></li>
//           </ul>
//         </div>

//         {/* ===== TOP CATEGORIES ===== */}
//         <div className="footer-section footer-top-categories">
//           <h4>Top Categories</h4>
//           <ul>
//             {topCategories.map(c => (
//               <li key={c._id}><Link to={`/category/${c._id}`}>{c.name}</Link></li>
//             ))}
//           </ul>
//         </div>

//         {/* ===== TRENDING NEWS ===== */}
//         <div className="footer-section footer-news">
//           <h4>Trending News</h4>
//           <ul>
//             {recentNews.slice(0, 5).map(n => (
//               <li key={n._id}>
//                 <Link to={`/news/${n._id}`}>{n.title}</Link>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* ===== NEWSLETTER & SOCIAL ===== */}
//         <div className="footer-section footer-newsletter">
//           <h4>Newsletter</h4>
//           <p>Get the latest tech news straight to your inbox.</p>
//           <form className="newsletter-form">
//             <input type="email" placeholder="Your email" required />
//             <button type="submit">Subscribe</button>
//           </form>

//           <div className="footer-socials">
//             <a href="#"><i className="fab fa-facebook-f"></i></a>
//             <a href="#"><i className="fab fa-twitter"></i></a>
//             <a href="#"><i className="fab fa-linkedin-in"></i></a>
//             <a href="#"><i className="fab fa-instagram"></i></a>
//           </div>

//           <div className="footer-ad">
//             <a href="https://affiliate-link.com" target="_blank">
//               <img src="/ads/sample-ad.jpg" alt="Ad" />
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* ===== FOOTER BOTTOM ===== */}
//       <div className="footer-bottom">
//         <p>© {new Date().getFullYear()} TechNews. All rights reserved.</p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;




import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = ({ categories = [], recentNews = [], topCategories = [] }) => {
  return (
    <footer className="footer">

      {/* ===== FOOTER TOP ===== */}
      <div className="footer-top">

        {/* ===== BRAND / ABOUT ===== */}
        <div className="footer-section footer-brand">
          <h2>Tech<span>News</span></h2>
          <p>Your ultimate source for technology news, reviews, and insights.</p>
        </div>

        {/* ===== QUICK LINKS ===== */}
        <div className="footer-section footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            {categories.map(c => (
              <li key={c._id}><Link to={`/category/${c._id}`}>{c.name}</Link></li>
            ))}
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* ===== TOP CATEGORIES ===== */}
        <div className="footer-section footer-top-categories">
          <h4>Top Categories</h4>
          <ul>
            {topCategories.map(c => (
              <li key={c._id}><Link to={`/category/${c._id}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>

        {/* ===== TRENDING NEWS ===== */}
        <div className="footer-section footer-news">
          <h4>Trending News</h4>
          <ul>
            {recentNews.slice(0, 5).map(n => (
              <li key={n._id}>
                <Link to={`/news/${n._id}`}>{n.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== NEWSLETTER & SOCIAL ===== */}
        <div className="footer-section footer-newsletter">
          <h4>Newsletter</h4>
          <p>Get the latest tech news straight to your inbox.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email" required />
            <button type="submit">Subscribe</button>
          </form>

          {/* ===== CLICKABLE SOCIAL ICONS ===== */}
          {/* <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
          </div> */}

<div className="footer-socials">
  {/* Facebook */}
  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#111" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12C22 6.48 17.52 2 12 2S2 6.48 2 12c0 4.84 3.66 8.84 8.44 9.8v-6.92h-2.54v-2.88h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.88h-2.34V21.8C18.34 20.84 22 16.84 22 12z"/>
    </svg>
  </a>

  {/* Twitter */}
  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#111" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.29 4.29 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.3 3.9A12.13 12.13 0 013 4.79a4.28 4.28 0 001.32 5.71 4.25 4.25 0 01-1.94-.54v.05a4.28 4.28 0 003.44 4.2 4.3 4.3 0 01-1.93.07 4.28 4.28 0 003.99 2.97A8.6 8.6 0 012 19.54 12.13 12.13 0 008.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.35-.02-.53A8.36 8.36 0 0022.46 6z"/>
    </svg>
  </a>

  {/* LinkedIn */}
  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#111" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.25c-.97 0-1.75-.79-1.75-1.75S5.53 4.25 6.5 4.25 8.25 5.03 8.25 6s-.78 1.75-1.75 1.75zm13.5 11.25h-3v-5.5c0-1.32-.03-3-1.83-3-1.83 0-2.11 1.43-2.11 2.91v5.59h-3v-10h2.89v1.36h.04c.4-.76 1.37-1.56 2.82-1.56 3.01 0 3.57 1.98 3.57 4.56v5.64z"/>
    </svg>
  </a>

  {/* Instagram */}
  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#111" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.4.6.21 1.03.46 1.48.91.45.45.7.88.91 1.48.16.46.34 1.26.4 2.43.058 1.26.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.4 2.43-.21.6-.46 1.03-.91 1.48-.45.45-.88.7-1.48.91-.46.16-1.26.34-2.43.4-1.26.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.4-.6-.21-1.03-.46-1.48-.91-.45-.45-.7-.88-.91-1.48-.16-.46-.34-1.26-.4-2.43C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.054-1.17.24-1.97.4-2.43.21-.6.46-1.03.91-1.48.45-.45.88-.7 1.48-.91.46-.16 1.26-.34 2.43-.4C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.735 0 8.332.012 7.052.07 5.77.128 4.828.308 4.034.57 3.06.88 2.23 1.334 1.41 2.154.59 2.974.136 3.804-.174 4.778c-.262.794-.442 1.736-.5 3.018C-.012 8.332 0 8.735 0 12s-.012 3.668.07 4.948c.058 1.282.238 2.224.5 3.018.31.974.764 1.804 1.584 2.624.82.82 1.65 1.274 2.624 1.584.794.262 1.736.442 3.018.5C8.332 23.988 8.735 24 12 24s3.668-.012 4.948-.07c1.282-.058 2.224-.238 3.018-.5.974-.31 1.804-.764 2.624-1.584.82-.82 1.274-1.65 1.584-2.624.262-.794.442-1.736.5-3.018.058-1.28.07-1.683.07-4.948s-.012-3.668-.07-4.948c-.058-1.282-.238-2.224-.5-3.018-.31-.974-.764-1.804-1.584-2.624-.82-.82-1.65-1.274-2.624-1.584-.794-.262-1.736-.442-3.018-.5C15.668.012 15.265 0 12 0z"/>
      <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zM18.406 4.594a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
    </svg>
  </a>
</div>


        </div>

      </div>

      {/* ===== FOOTER BOTTOM ===== */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} TechNews. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
