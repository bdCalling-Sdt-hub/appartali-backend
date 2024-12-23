const { validationResult } = require("express-validator");
const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");
const Reservation = require("../model/reservation.model");
const { emailWithNodemailerGmail } = require("../config/email.config");
const User = require("../model/user.model");
const Notification = require("../model/notification.model");

const reserveProperty = async (req, res) => {
  try {
    // const validation = validationResult(req).array();
    // if (validation.length) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to add property", validation[0].msg));
    // }
    const userId = req.user._id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("please login first", "User not found"));
    }

    const user = await User.findById(userId);
    const admin = await User.findOne({ role: "admin" });

    if (!user) {
      return res.status(HTTP_STATUS.OK).send(failure("User not found"));
    }

    const { propertyId, checkInDate, checkOutDate, guests, totalPrice } =
      req.body;

    const newReservation = new Reservation({
      property: propertyId,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      user: userId,
    });

    if (!newReservation) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to add reservation"));
    }

    const reservation = await newReservation.save();
    const emailData = {
      email: user.email,
      subject: "Room successfully booked",
      html: `
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hello, ${user?.firstName || "User"}</h2>
                    <p>Your reservation has been successfully confirmed.</p>
                    <p>We’re delighted to have you stay with us and look forward to providing you with a memorable experience. For any questions or further assistance, feel free to reach out.</p>
                    <p>Best regards,<br/><strong>Appartali Team</strong></p>
                </body>
            </html>
            `,
    };
    emailWithNodemailerGmail(emailData);

    const newNotification = await Notification.create({
      applicant: user._id || null,
      admin: admin._id || null,
      status: "approved",
      message: `${user.email} has reserved a room.`,
    });

    if (!newNotification) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Could not send notification"));
    }

    user.notifications.push(newNotification._id);
    user.reservations.push(reservation._id);
    await user.save();

    if (admin) {
      admin.notifications.push(newNotification._id);
      await admin.save();
    }
    res
      .status(HTTP_STATUS.CREATED)
      .send(success("reserved room successfully", reservation));
  } catch (error) {
    console.log(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    switch (status) {
      case "upcoming":
        query = { checkInDate: { $gte: new Date() } };
        break;
      case "checkin":
        query = {
          checkInDate: { $lte: new Date() },
          checkOutDate: { $gte: new Date() },
        };
        break;
      case "checkout":
        query = { checkOutDate: { $lt: new Date() } };
        break;
      default:
        break;
    }

    const reservations = await Reservation.find(query).populate(
      "property user"
    );

    res.status(HTTP_STATUS.OK).send({
      success: true,
      message: "reservations fetched successfully",
      reservations,
    });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const getReservationById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please provide room id" });
    }
    const room = await Reservation.findById(req.params.id).populate(
      "property user"
    );
    res
      .status(HTTP_STATUS.OK)
      .send({ success: true, message: "Room fetched successfully", room });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const getReservationByUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please login first" });
    }
    const rooms = await Reservation.find({ user: req.user._id }).populate(
      "property user"
    );
    if (!rooms.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send({ success: false, message: "reservations not found" });
    }
    res.status(HTTP_STATUS.OK).send({
      success: true,
      message: "reservations fetched successfully",
      rooms,
    });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const toggleStatus = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please login first" });
    }
    const { reservationId, checkinCheckoutStatus } = req.body;
    const reservation = await Reservation.findById({ _id: reservationId });
    if (!reservation) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send({ success: false, message: "reservation not found" });
    }

    if (
      checkinCheckoutStatus === "checkin" ||
      checkinCheckoutStatus === "checkout"
    ) {
      reservation.checkinCheckoutStatus = checkinCheckoutStatus;
      await reservation.save();
      return res.status(HTTP_STATUS.OK).send({
        success: true,
        message: "reservation status updated successfully",
        reservation,
      });
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).send({
      success: false,
      message: "Invalid status",
    });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

module.exports = {
  reserveProperty,
  getAllReservations,
  getReservationById,
  getReservationByUser,
  toggleStatus,
};
