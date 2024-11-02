const express = require("express");
const routes = express();
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  getPropertyByOwner,
  updateProperty,
  deletePropertyById,
  //   disableServiceById,
  //   enableServiceById,
  approvePropertyById,
  cancelPropertyById,
} = require("../controller/property.controller");
const fileUpload = require("../middleware/fileUpload");
const {
  isAuthorizedAdmin,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");
const { roomValidator } = require("../middleware/validation");

routes.post(
  "/add-property",
  isAuthorizedUser,
  fileUpload(),
  roomValidator.create,
  createProperty
);

routes.get(
  "/get-all-properties",
  // userValidator.create,
  // authValidator.create,
  getAllProperties
);

routes.get("/get-property-by-id/:id", getPropertyById);

routes.get("/get-property-by-owner", isAuthorizedUser, getPropertyByOwner);

routes.put(
  "/update-property-by-id/:id",
  isAuthorizedUser,
  fileUpload(),
  roomValidator.update,
  updateProperty
);

routes.delete(
  "/delete-property-by-id/:id",
  isAuthorizedUser,
  deletePropertyById
);

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

routes.patch(
  "/approve-property-by-id/:id",
  isAuthorizedAdmin,
  approvePropertyById
);

routes.patch(
  "/cancel-property-by-id/:id",
  isAuthorizedAdmin,
  cancelPropertyById
);

module.exports = routes;
