const express = require("express");
const routes = express();
const {
  reserveProperty,
  getAllReservations,
  getReservationById,
  getReservationByUser,
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

routes.get(
  "/get-all-reservations",
  // userValidator.create,
  // authValidator.create,
  getAllReservations
);

routes.get("/get-reservation-by-id/:id", getReservationById);

routes.get("/get-reservation-by-user", isAuthorizedUser, getReservationByUser);

module.exports = routes;
