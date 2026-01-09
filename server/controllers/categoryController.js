const Category = require("../models/Category");
const slugify = require("slugify");

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const category = await Category.create({
    ...req.body,
    slug: slugify(name, { lower: true })
  });
  res.json(category);
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(category);
};

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ status: "active" }).sort("order");
  res.json(categories);
};
