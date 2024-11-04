const express = require("express");
const routes = express();
const { reviewValidator, userValidator } = require("../middleware/validation");
const {
  addReviewToProperty,
  editReview,
  getAllWebsiteReviews,
  getReviewByReviewId,
  getReviewByUserId,
  deleteReview,
} = require("../controller/review.controller");
// const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { isAuthorizedUser } = require("../middleware/authValidationJWT");
// const reviewValidator = require("../middleware/reviewValidation")

routes.get("/all-reviews", getAllWebsiteReviews);
routes.get("/review-by-user", isAuthorizedUser, getReviewByUserId);
routes.get("/get-one-review/:reviewId", getReviewByReviewId);

routes.post(
  "/add-review",
  //   isAuthorizedUser,
  //   reviewValidator.addReview,
  isAuthorizedUser,
  addReviewToProperty
);

routes.delete(
  "/delete-review/:reviewId",
  isAuthorizedUser,
  //   userValidator.delete,
  deleteReview
);

routes.put(
  "/update-review/:reviewId",
  isAuthorizedUser,
  //   reviewValidator.updateReview,
  editReview
);

module.exports = routes;
