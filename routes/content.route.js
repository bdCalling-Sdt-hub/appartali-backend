const express = require("express");
const routes = express();
const fileUpload = require("../middleware/fileUpload");

const {
  updateHomeContent,
  getHomeContent,
  updateAboutContent,
  getAboutContent,
  getBlog,
  updateBlog,
} = require("../controller/content.controller");

routes.get("/get-home-content", getHomeContent);
routes.put("/update-home-content", updateHomeContent);

routes.get("/get-about-content", getAboutContent);
routes.put("/update-about-content", updateAboutContent);

routes.get("/get-blog", getBlog);
routes.put("/update-blog", fileUpload(), updateBlog);

module.exports = routes;
