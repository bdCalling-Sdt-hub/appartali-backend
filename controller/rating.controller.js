const { validationResult } = require("express-validator");
const { failure, success } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");
const Rating = require("../model/rating.model");
const Property = require("../model/property.model");
const addRatingToProperty = async (req, res) => {
  try {
    // const validation = validationResult(req).array();
    // console.log(validation);
    // if (validation.length > 0) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to add the review", validation[0].msg));
    // }
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS.OK).send(failure("please login first"));
    }
    const authId = req.user._id;

    const { propertyId, cleanliness, checkin, communication, values } =
      req.body;

    if (!propertyId || !cleanliness || !checkin || !communication || !values) {
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

    const propertyRating = await Rating.findOne({
      property: propertyId,
      user: authId,
    });

    if (propertyRating) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Same user cannot review twice"));
    }

    const totalRating =
      (Number(cleanliness) +
        Number(checkin) +
        Number(communication) +
        Number(values)) /
      4;

    const newRating = await Rating.create({
      user: authId,
      property: propertyId,
      cleanliness,
      checkin,
      communication,
      values,
      averageRating: totalRating,
    });
    // Update property with new review
    if (!newRating) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Failed to add the rating"));
    }

    property.ratings.push(newRating._id);
    property.totalRatings += 1;
    property.averageRating =
      (property.averageRating * (property.totalRatings - 1) + totalRating) /
      property.totalRatings;

    await property.save();

    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("Rating added successfully", newRating));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const getAllWebsiteRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({}).populate("user");

    if (ratings) {
      return res
        .status(HTTP_STATUS.OK)
        .send(success("all ratings fetched successfully", ratings));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(failure("ratings could not be fetched"));
  } catch (error) {
    console.log(error);
    return res.status(400).send(`internal server error`);
  }
};

const getRatingByRatingId = async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await Rating.findOne({ _id: ratingId });
    if (!rating) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("rating could not be fetched"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("rating fetched successfully", rating));
  } catch (error) {
    console.log(error);
    return res.status(400).send(failure("internal server error", error));
  }
};

const getRatingByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const rating = await Rating.find({ property: propertyId });
    if (!rating) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("rating could not be fetched"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("rating fetched successfully", rating));
  } catch (error) {
    console.log(error);
    return res.status(400).send(failure("internal server error", error));
  }
};

const getRatingByUserId = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS.OK).send(failure("please login first"));
    }
    const userId = req.user._id;

    const rating = await Rating.findOne({ user: userId });
    if (!rating) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("rating could not be fetched"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("rating fetched successfully", rating));
  } catch (error) {
    console.log(error);
    return res.status(400).send(`internal server error`);
  }
};

const editRating = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS.OK).send(failure("please login first"));
    }
    const userId = req.user._id;
    const { cleanliness, checkin, communication, values } = req.body;
    const { ratingId } = req.params;

    if (!ratingId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("ratingId is required"));
    }

    const ratingExists = await Rating.findOne({
      _id: ratingId,
      user: userId,
    });

    if (!ratingExists) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("rating does not exist"));
    }

    const property = await Property.findById(ratingExists.property);

    ratingExists.cleanliness = cleanliness || ratingExists.cleanliness;
    ratingExists.checkin = checkin || ratingExists.checkin;
    ratingExists.communication = communication || ratingExists.communication;
    ratingExists.values = values || ratingExists.values;

    const totalRating =
      (Number(ratingExists.cleanliness) +
        Number(ratingExists.checkin) +
        Number(ratingExists.communication) +
        Number(ratingExists.values)) /
      4;
    ratingExists.averageRating = totalRating;

    property.averageRating =
      (property.averageRating * (property.totalRatings - 1) + totalRating) /
      property.totalRatings;

    await property.save();
    await ratingExists.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("rating updated successfully", ratingExists));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error", error));
  }
};

const deleteRating = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS.OK).send(failure("please login first"));
    }
    const userId = req.user._id;
    const { ratingId } = req.params;
    if (!ratingId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("ratingId is required"));
    }
    const deletedReview = await Rating.findByIdAndDelete({
      _id: ratingId,
      user: userId,
    });
    if (!deletedReview) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("rating could not be deleted"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("rating deleted successfully", deletedReview));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error", error));
  }
};

module.exports = {
  addRatingToProperty,
  getAllWebsiteRatings,
  getRatingByUserId,
  getRatingByPropertyId,
  getRatingByRatingId,
  editRating,
  deleteRating,
};
