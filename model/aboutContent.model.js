const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aboutContentSchema = new Schema(
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
    mainTitle: {
      type: String,
      required: true,
      trim: true,
    },
    firstStepTitle: {
      type: String,
      required: true,
      trim: true,
    },
    firstStepDescription: {
      type: String,
      required: true,
      trim: true,
    },
    secondStepTitle: {
      type: String,
      required: true,
      trim: true,
    },
    secondStepDescription: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("aboutContent", aboutContentSchema);
