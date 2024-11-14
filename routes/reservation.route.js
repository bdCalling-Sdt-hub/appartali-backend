const express = require("express");
const routes = express();
const {
  reserveProperty,
  getAllReservations,
  getReservationById,
  getReservationByUser,
  toggleStatus,
} = require("../controller/reservation.controller");
const fileUpload = require("../middleware/fileUpload");
const {
  isAuthorizedAdmin,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");
const { roomValidator } = require("../middleware/validation");

routes.post(
  "/reserve-property",
  isAuthorizedUser,
  fileUpload(),
  reserveProperty
);

routes.get("/get-all-reservations", getAllReservations);

routes.get("/get-reservation-by-id/:id", getReservationById);

routes.get("/get-reservation-by-user", isAuthorizedUser, getReservationByUser);

routes.post("/toggle-status", isAuthorizedUser, toggleStatus);

module.exports = routes;
