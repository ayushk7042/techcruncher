import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";
import "./Contacts.css";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get("/contact");
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendReply = async (id) => {
    if (!replyText.trim()) return alert("Reply required");

    try {
      setLoading(true);
      await api.post(`/contact/${id}/reply`, { reply: replyText });
      setReplyText("");
      setActiveId(null);
      fetchContacts();
      alert("Reply sent successfully");
    } catch {
      alert("Reply failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-contacts">
        <h1>Contact Messages</h1>

        {contacts.length === 0 && <p>No messages yet</p>}

        {contacts.map(c => (
          <div key={c._id} className="contact-card">
            <div className="contact-head">
              <h3>{c.name}</h3>
              <span>{c.email}</span>
            </div>

            <p className="contact-message">{c.message}</p>

            {c.adminReply ? (
              <div className="contact-reply">
                <strong>Admin Reply:</strong>
                <p>{c.adminReply}</p>
              </div>
            ) : (
              <>
                {activeId === c._id && (
                  <textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                )}

                <div className="contact-actions">
                  {activeId === c._id ? (
                    <button
                      onClick={() => sendReply(c._id)}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Reply"}
                    </button>
                  ) : (
                    <button onClick={() => setActiveId(c._id)}>
                      Reply
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Contacts;
