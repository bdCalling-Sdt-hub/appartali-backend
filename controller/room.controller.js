const { validationResult } = require("express-validator");
const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");
const Room = require("../model/room.model");
const User = require("../model/user.model");
const Notification = require("../model/notification.model");

const createRoom = async (req, res) => {
  try {
    const validation = validationResult(req).array();
    if (validation.length) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to add room", validation[0].msg));
    }
    const {
      category,
      location,
      roomCount,
      description,
      pricePerNight,
      maxGuests,
      image,
      startDate,
      endDate,
    } = req.body;

    console.log(
      category,
      location,
      roomCount,
      description,
      pricePerNight,
      maxGuests,
      image,
      startDate,
      endDate
    );

    const newRoom = new Room({
      category,
      location,
      roomCount,
      description,
      pricePerNight,
      maxGuests,
      startDate,
      endDate,
      images: image && image.length ? image : [],
    });

    if (!newRoom) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to add room", "error in adding room"));
    }

    if (req.files && req.files["productImage"]) {
      const imageFileNames = req.files.productImage.map(
        (file) => `/uploads/${file.filename}`
      );
      newRoom.images = [...newRoom.images, ...imageFileNames];
    }

    const room = await newRoom.save();
    res
      .status(HTTP_STATUS.CREATED)
      .send(success("Room added successfully", room));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res
      .status(HTTP_STATUS.OK)
      .send({ success: true, message: "Rooms fetched successfully", rooms });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please provide room id" });
    }
    const room = await Room.findById(req.params.id);
    res
      .status(HTTP_STATUS.OK)
      .send({ success: true, message: "Room fetched successfully", room });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

module.exports = { createRoom, getAllRooms, getRoomById };
