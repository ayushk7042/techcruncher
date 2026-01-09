import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";
import "./CategoryForm.css";




const AddEditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "",
    seoTitle: "",
    seoDescription: "",
    showOnHome: true,
    order: 0,
    status: "active",
  });

  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      api.get("/category").then((res) => {
        const cat = res.data.find((c) => c._id === id);
        if (cat) setForm(cat);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/category/${id}`, form);
      } else {
        await api.post("/category", form);
      }
      navigate("/admin/categories");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <AdminLayout>
      <h1>{isEdit ? "Edit Category" : "Add Category"}</h1>

      <form className="form" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Category Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="icon"
          placeholder="Icon class / URL"
          value={form.icon}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="seoTitle"
          placeholder="SEO Title"
          value={form.seoTitle}
          onChange={handleChange}
        />

        <textarea
          name="seoDescription"
          placeholder="SEO Description"
          value={form.seoDescription}
          onChange={handleChange}
        />

        <input
          type="number"
          name="order"
          placeholder="Order"
          value={form.order}
          onChange={handleChange}
        />

        <label>
          <input
            type="checkbox"
            name="showOnHome"
            checked={form.showOnHome}
            onChange={handleChange}
          />
          Show on Homepage
        </label>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button className="btn">Save Category</button>
      </form>
    </AdminLayout>
  );
};

export default AddEditCategory;
