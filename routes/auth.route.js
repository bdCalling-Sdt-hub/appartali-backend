const express = require("express");
const routes = express();
const {
  signup,
  verifyEmail,
  login,
  logout,
  signupAsOwner,
  approveOwner,
  cancelOwner,
  loginAsOwner,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controller/auth.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const {
  isAuthorizedUser,
  isAuthorizedAdmin,
} = require("../middleware/authValidationJWT");

// for signing up
routes.post("/auth/signup", authValidator.create, signup);

// for signing up as doctor
routes.post("/auth/signup-as-owner", authValidator.create, signupAsOwner);

routes.post(
  "/auth/verify-email",

  verifyEmail
);

routes.post(
  "/auth/forgot-password",
  // userValidator.create,
  // authValidator.create,
  forgotPassword
);

routes.post(
  "/auth/reset-password",
  // userValidator.create,
  // authValidator.create,
  resetPassword
);

routes.post(
  "/auth/change-password",
  // userValidator.create,
  // authValidator.create,
  changePassword
);

// for approving doctor
routes.post(
  "/auth/approve-owner",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedAdmin,
  approveOwner
);

// for canceling doctor
routes.post(
  "/auth/cancel-owner",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedAdmin,
  cancelOwner
);

// for logging in
routes.post("/auth/login", authValidator.login, login);

// for logging in
routes.post("/auth/login-as-owner", authValidator.login, loginAsOwner);

// for logging in
routes.post("/auth/logout", logout);

module.exports = routes;
