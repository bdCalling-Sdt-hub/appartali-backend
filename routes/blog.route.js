const express = require("express");
const routes = express();
const fileUpload = require("../middleware/fileUpload");

const {
  addBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  getAllBlogs,
} = require("../controller/blog.controller");

routes.get("/get-all-blogs", getAllBlogs);
routes.get("/get-one-blog/:id", getBlogById);
routes.post("/add-blog", fileUpload(), addBlog);
routes.put("/update-blog/:id", fileUpload(), updateBlogById);
routes.delete("/delete-blog-by-id/:id", deleteBlogById);

module.exports = routes;
