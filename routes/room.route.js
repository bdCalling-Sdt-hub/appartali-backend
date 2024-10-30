const express = require("express");
const routes = express();
const {
  createRoom,
  //   getAllServices,
  //   getServiceById,
  //   getServiceByDoctorId,
  //   updateServiceById,
  //   deleteServiceById,
  //   disableServiceById,
  //   enableServiceById,
  //   approveServiceById,
  //   cancelServiceById,
} = require("../controller/room.controller");
const fileUpload = require("../middleware/fileUpload");
const { isAuthorizedAdmin } = require("../middleware/authValidationJWT");
const { roomValidator } = require("../middleware/validation");

routes.post(
  "/add-room",
  isAuthorizedAdmin,
  fileUpload(),
  roomValidator.create,
  createRoom
);

// routes.get(
//   "/get-all-services",
//   // userValidator.create,
//   // authValidator.create,
//   getAllServices
// );

// routes.get(
//   "/get-service-by-id/:id",
//   // userValidator.create,
//   // authValidator.create,
//   getServiceById
// );

// routes.get(
//   "/get-service-by-doctorId/:id",
//   // userValidator.create,
//   // authValidator.create,
//   getServiceByDoctorId
// );

// routes.put(
//   "/update-service-by-id/:id",
//   // userValidator.create,
//   // authValidator.create,
//   isAuthorizedAdmin,
//   updateServiceById
// );

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