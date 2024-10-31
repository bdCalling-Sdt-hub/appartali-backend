const express = require("express");
const routes = express();
const {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomsByOwner,
  updateRoom,
  //   deleteServiceById,
  //   disableServiceById,
  //   enableServiceById,
  //   approveServiceById,
  //   cancelServiceById,
} = require("../controller/room.controller");
const fileUpload = require("../middleware/fileUpload");
const {
  isAuthorizedAdmin,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");
const { roomValidator } = require("../middleware/validation");

routes.post(
  "/add-room",
  isAuthorizedUser,
  fileUpload(),
  roomValidator.create,
  createRoom
);

routes.get(
  "/get-all-rooms",
  // userValidator.create,
  // authValidator.create,
  getAllRooms
);

routes.get("/get-room-by-id/:id", getRoomById);

routes.get("/get-room-by-owner", isAuthorizedUser, getRoomsByOwner);

routes.put(
  "/update-room-by-id/:id",
  isAuthorizedUser,
  fileUpload(),
  roomValidator.update,
  updateRoom
);

// routes.delete(
//   "/delete-service-by-id/:id",
//   // userValidator.create,
//   // authValidator.create,
//   isAuthorizedAdmin,
//   deleteServiceById
// );

// routes.patch(
//   "/disable-service-by-id/:id",
//   // userValidator.create,
//   // authValidator.create,
//   isAuthorizedAdmin,
//   disableServiceById
// );

// routes.patch(
//   "/enable-service-by-id/:id",
//   // userValidator.create,
//   // authValidator.create,
//   isAuthorizedAdmin,
//   enableServiceById
// );

// routes.patch(
//   "/approve-service-by-id/:id",
//   // userValidator.create,
//   // authValidator.create,
//   isAuthorizedAdmin,
//   approveServiceById
// );

// routes.patch(
//   "/cancel-service-by-id/:id",
//   // userValidator.create,
//   // authValidator.create,
//   cancelServiceById
// );

module.exports = routes;
