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
    },
    password: {
      type: String,
      minlength: 5,
      select: false,
      validate: {
        validator: function () {
          return this.loginType === "email" ? !!this.password : true;
        },
        message: "Please provide a password",
      },
    },
    // password: {
    //   type: String,
    //   required: [true, "Please provide a password"],
    //   minlength: 5,
    //   select: false,
    // },
    loginType: {
      type: String,
      enum: ["email", "social"],
      default: "email",
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
    },

    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
    isOwner: {
      type: Boolean,

      default: false,
    },

    emailVerified: {
      type: Boolean,

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

// userSchema.pre("save", (next) => {
//   if (this.loginType === "social") {
//     this.password.required = false;
//   } else {
//     this.password.required = true;
//   }
//   next();
// });

const User = mongoose.model("User", userSchema);
module.exports = User;
