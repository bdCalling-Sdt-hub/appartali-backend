const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const homeContentSchema = new Schema(
  {
    heroTitle: {
      type: String,
      required: true,
      trim: true,
    },
    heroDescription: {
      type: String,
      required: true,
      trim: true,
    },
    roomsTitle: {
      type: String,
      required: true,
      trim: true,
    },
    propertyTitle: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeContent", homeContentSchema);
