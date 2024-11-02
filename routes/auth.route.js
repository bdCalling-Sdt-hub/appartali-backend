const express = require("express");
const routes = express();
const {
  signup,
  verifyEmail,
  login,
  loginSocial,
  logout,
  signupAsOwner,
  approveOwner,
  cancelOwner,
  loginAsOwner,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controller/auth.controller");
const { authValidator } = require("../middleware/validation");
const { isAuthorizedAdmin } = require("../middleware/authValidationJWT");

// for signing up
routes.post("/auth/signup", authValidator.create, signup);

// for signing up as owner
routes.post("/auth/signup-as-owner", authValidator.create, signupAsOwner);

routes.post("/auth/verify-email", verifyEmail);

routes.post("/auth/forgot-password", forgotPassword);

routes.post("/auth/reset-password", resetPassword);

routes.post(
  "/auth/change-password",
  // userValidator.create,
  // authValidator.create,
  changePassword
);

// for approving owner
routes.post("/auth/approve-owner", isAuthorizedAdmin, approveOwner);

// for canceling owner
routes.post("/auth/cancel-owner", isAuthorizedAdmin, cancelOwner);

routes.post("/auth/login", authValidator.login, login);

routes.post("/auth/login-social", loginSocial);

routes.post("/auth/login-as-owner", authValidator.login, loginAsOwner);

routes.post("/auth/logout", logout);

module.exports = routes;
