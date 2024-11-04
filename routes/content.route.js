const express = require("express");
const routes = express();

const {
  updateHomeContent,
  getHomeContent,
} = require("../controller/content.controller");

routes.get("/get-home-content", getHomeContent);
routes.put("/update-home-content", updateHomeContent);

module.exports = routes;
