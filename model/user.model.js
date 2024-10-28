const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "please provide email"],
      unique: true,
    },
    image: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 5,
      select: false,
    },
    role: {
      type: [String],
      enum: ["guest", "owner", "admin"],
      default: "guest",
    },
    ownerApplicationStatus: {
      type: String,
      enum: ["notApplied", "pending", "approved", "cancelled"],
      default: "notApplied",
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    dateOfBirth: {
      type: Date,
      // required: true
    },

    // services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
    isOwner: {
      type: Boolean,
      required: false,
      default: false,
    },

    emailVerified: {
      type: Boolean,
      required: false,
      default: false,
    },

    emailVerifyCode: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    reviews: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
