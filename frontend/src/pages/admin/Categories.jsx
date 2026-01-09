import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";
import "./Categories.css";




const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await api.delete(`/category/${id}`);
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Categories</h1>
        <Link to="/admin/categories/add" className="btn">
          + Add Category
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Order</th>
              <th>Status</th>
              <th>Home</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td>{cat.order}</td>
                <td>{cat.status}</td>
                <td>{cat.showOnHome ? "Yes" : "No"}</td>
                <td>
                  <Link
                    to={`/admin/categories/edit/${cat._id}`}
                    className="btn-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteCategory(cat._id)}
                    className="btn-sm danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
};

export default Categories;
