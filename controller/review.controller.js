const { validationResult } = require("express-validator");
const { failure, success } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");
const Review = require("../model/review.model");
const Property = require("../model/property.model");
const addReviewToProperty = async (req, res) => {
  try {
    // const validation = validationResult(req).array();
    // // console.log(validation);
    // if (validation.length > 0) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to add the review", validation[0].msg));
    // }
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS.OK).send(failure("please login first"));
    }
    const authId = req.user._id;

    const { propertyId, review, rating } = req.body;

    if (!propertyId || !review || !rating) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide all the required fields"));
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Property not found"));
    }

    const propertyReview = await Review.findOne({
      property: propertyId,
      user: authId,
    });

    if (propertyReview) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Same user cannot review twice"));
    }

    const newReview = await Review.create({
      user: authId,
      property: propertyId,
      review: review,
      rating: rating,
    });
    // Update property with new review
    if (!newReview) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Failed to add the review"));
    }

    property.reviews.push(newReview._id);

    property.totalRatings += 1;
    property.averageRating =
      (property.averageRating * (property.totalRatings - 1) + rating) /
      property.totalRatings;

    await property.save();

    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("Review added successfully", newReview));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const getAllWebsiteReviews = async (req, res) => {
  try {
    const reviews = await Review.find({});

    if (reviews) {
      return res
        .status(HTTP_STATUS.OK)
        .send(success("all reviews fetched successfully", reviews));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(failure("reviews could not be fetched"));
  } catch (error) {
    console.log(error);
    return res.status(400).send(`internal server error`);
  }
};

const getReviewByReviewId = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId }).populate("user");
    if (!review) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("review could not be fetched"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("review fetched successfully", review));
  } catch (error) {
    console.log(error);
    return res.status(400).send(`internal server error`);
  }
};

const getReviewByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const review = await Review.find({ property: propertyId }).populate("user");
    if (!review) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("review could not be fetched"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("review fetched successfully", review));
  } catch (error) {
    console.log(error);
    return res.status(400).send(`internal server error`);
  }
};

const getReviewByUserId = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS.OK).send(failure("please login first"));
    }
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("All fields are required"));
    }

    const review = await Review.findOne({ user: userId }).populate("user");
    if (!review) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("review could not be fetched"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("review fetched successfully", review));
  } catch (error) {
    console.log(error);
    return res.status(400).send(`internal server error`);
  }
};

const editReview = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS.OK).send(failure("please login first"));
    }
    const userId = req.user._id;
    const { review, rating } = req.body;
    const { reviewId } = req.params;

    if (!reviewId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("reviewId is required"));
    }

    const reviewExists = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!reviewExists) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("review does not exist"));
    }

    reviewExists.review = review || reviewExists.review;
    reviewExists.rating = rating || reviewExists.rating;
    await reviewExists.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("review updated successfully", reviewExists));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const deleteReview = async (req, res) => {
  try {
    console.log(req.user);
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS.OK).send(failure("please login first"));
    }
    const userId = req.user._id;
    const { reviewId } = req.params;
    if (!reviewId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("reviewId is required"));
    }
    const deletedReview = await Review.findByIdAndDelete({
      _id: reviewId,
      user: userId,
    });
    if (!deletedReview) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("review could not be deleted"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("review deleted successfully", deletedReview));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

module.exports = {
  addReviewToProperty,
  getAllWebsiteReviews,
  getReviewByUserId,
  getReviewByPropertyId,
  getReviewByReviewId,
  editReview,
  deleteReview,
};
