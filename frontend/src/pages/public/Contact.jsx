import { useState } from "react";
import api from "../../api/axios";
import "./Contact.css";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await api.post("/contact", form);
      setSuccess("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-root">
      {/* HERO */}
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>We’d love to hear from you. Let’s talk.</p>
      </section>

      {/* CONTENT */}
      <section className="contact-container">
        {/* LEFT INFO */}
        <div className="contact-info">
          <h2>Get in touch</h2>
          <p>
            Have a question, feedback, or partnership idea?
            Fill the form and our team will get back to you.
          </p>

          <div className="contact-details">
            <div>
              <span>📧</span>
              <p>affalliances@.com</p>
            </div>
            <div>
              <span>📞</span>
              <p>+91 98765 43210</p>
            </div>
            <div>
              <span>📍</span>
              <p>India</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send a message</h3>

          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your message"
            rows="5"
            value={form.message}
            onChange={handleChange}
            required
          />

          <button disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>

          {success && <p className="contact-success">{success}</p>}
        </form>
      </section>
    </div>
  );
};

export default Contact;
