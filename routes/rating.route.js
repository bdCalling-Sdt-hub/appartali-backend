const express = require("express");
const routes = express();
const {
  addRatingToProperty,
  editRating,
  getAllWebsiteRatings,
  getRatingByRatingId,
  getRatingByUserId,
  getRatingByPropertyId,
  deleteRating,
} = require("../controller/rating.controller");
const { isAuthorizedUser } = require("../middleware/authValidationJWT");

routes.get("/all-ratings", getAllWebsiteRatings);
routes.get("/rating-by-user", isAuthorizedUser, getRatingByUserId);
routes.get("/get-one-rating/:ratingId", getRatingByRatingId);
routes.get("/rating-by-property/:propertyId", getRatingByPropertyId);

routes.post("/add-rating", isAuthorizedUser, addRatingToProperty);

routes.delete("/delete-rating/:ratingId", isAuthorizedUser, deleteRating);

routes.put("/update-rating/:ratingId", isAuthorizedUser, editRating);

module.exports = routes;
