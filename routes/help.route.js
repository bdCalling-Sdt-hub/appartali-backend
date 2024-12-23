const express = require("express");
const routes = express();
const {
  addHelp,
  updateHelp,
  getAllHelps,
  deleteHelp,
  sendMailToSupport,
} = require("../controller/help.controller");

routes.post("/add-help", addHelp);
routes.put("/update-help", updateHelp);
routes.get("/get-all-helps", getAllHelps);
routes.delete("/delete-help/:helpId", deleteHelp);
routes.post("/send-mail-to-support", sendMailToSupport);
module.exports = routes;
