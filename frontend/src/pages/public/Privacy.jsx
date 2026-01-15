// src/pages/privacy/Privacy.jsx
import React from "react";
import "./Privacy.css";

const Privacy = () => {
  return (
    <div className="privacy-root">

      {/* ===== HERO / TITLE ===== */}
      <section className="privacy-hero">
        <h1>Privacy Policy</h1>
        <p>Your privacy is important to us. Here's how we handle your information.</p>
      </section>

      {/* ===== CONTENT SECTIONS ===== */}
      <section className="privacy-content">

        <h2>1. Information We Collect</h2>
        <p>
          We may collect personal information such as your name, email address, and usage data when you interact with our website. This information helps us improve our services.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          The information collected may be used to send newsletters, respond to inquiries, personalize content, and improve user experience.
        </p>

        <h2>3. Cookies</h2>
        <p>
          We use cookies to track visitor behavior and enhance website performance. You can choose to disable cookies in your browser settings.
        </p>

        <h2>4. Third-Party Services</h2>
        <p>
          Our website may use third-party services for analytics, advertising, and other functionalities. These third parties may collect information according to their own policies.
        </p>

        <h2>5. Data Security</h2>
        <p>
          We take data security seriously and implement measures to protect your information from unauthorized access or disclosure.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data. To exercise your rights, please contact us via the contact page.
        </p>

        <h2>7. Changes to this Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Any changes will be reflected on this page with the last updated date.
        </p>

      </section>
    </div>
  );
};

export default Privacy;
