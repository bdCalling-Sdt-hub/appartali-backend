const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new Schema(
  {
    category: {
      type: String,
      // required: true,
      ref: "Category",
    },
    name: {
      type: String,
      // required: true,
    },
    location: {
      type: String,
      // required: true,
    },
    roomCount: {
      type: Number,
      // required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    images: {
      type: [String],
    },
    pricePerNight: {
      type: Number,
      // required: true,
    },
    maxGuests: {
      type: Number,
      // required: true,
    },
    startDate: {
      type: Date,
      // required: true,
    },
    endDate: {
      type: Date,
      // required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    ratings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    services: [
      {
        type: String,
        // required: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
    roomId: {
      type: String,
    },
    satisfiedGuests: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
