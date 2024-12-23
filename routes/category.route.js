const express = require("express");
const routes = express();
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
} = require("../controller/category.controller");
const { isAuthorizedAdmin } = require("../middleware/authValidationJWT");

routes.post("/add-category", isAuthorizedAdmin, createCategory);

routes.get("/get-category/:id", getCategoryById);
routes.get("/get-all-categories", getAllCategories);
routes.put("/edit-category/:id", isAuthorizedAdmin, updateCategory);

routes.delete("/delete-category/:id", isAuthorizedAdmin, deleteCategory);

module.exports = routes;
