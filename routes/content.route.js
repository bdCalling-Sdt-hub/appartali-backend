const express = require("express");
const routes = express();

const {
  updateHomeContent,
  getHomeContent,
  updateAboutContent,
  getAboutContent,
} = require("../controller/content.controller");

routes.get("/get-home-content", getHomeContent);
routes.put("/update-home-content", updateHomeContent);

routes.get("/get-about-content", getAboutContent);
routes.put("/update-about-content", updateAboutContent);

module.exports = routes;
