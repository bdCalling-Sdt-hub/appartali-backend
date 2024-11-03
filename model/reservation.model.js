const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled"],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
