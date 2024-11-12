const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  cleanliness: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  checkin: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  communication: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  values: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  averageRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    // default: function () {
    //   return (
    //     (this.cleanliness + this.checkin + this.communication + this.values) / 4
    //   );
    // },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
});

module.exports = mongoose.model("Rating", ratingSchema);
