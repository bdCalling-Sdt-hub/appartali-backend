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
    const userId = req.user._id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("please login first", "User not found"));
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

    const newRoom = new Room({
      category,
      location,
      roomCount,
      description,
      pricePerNight,
      maxGuests,
      startDate,
      endDate,
      owner: userId,
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

const getRoomsByOwner = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please login first" });
    }
    const rooms = await Room.find({ owner: req.user._id }).populate("owner");
    res
      .status(HTTP_STATUS.OK)
      .send({ success: true, message: "Rooms fetched successfully", rooms });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const validation = validationResult(req).array();
    if (validation.length) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to update room", validation[0].msg));
    }
    if (!req.user || !req.user._id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please login first" });
    }
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please provide room id" });
    }
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res
        .status(HTTP_STATUS.OK)
        .send({ success: false, message: "Room not found" });
    }
    console.log("req.user._id", req.user._id);
    console.log("room.owner", room.owner);
    if (room.owner.toString() !== req.user._id.toString()) {
      return res
        .status(HTTP_STATUS.OK)
        .send({ success: false, message: "You are not authorized" });
    }

    const {
      category,
      location,
      roomCount,
      description,
      pricePerNight,
      maxGuests,
      startDate,
      endDate,
    } = req.body;

    room.category = category || room.category;
    room.location = location || room.location;
    room.roomCount = roomCount || room.roomCount;
    room.description = description || room.description;
    room.pricePerNight = pricePerNight || room.pricePerNight;
    room.maxGuests = maxGuests || room.maxGuests;
    room.startDate = startDate || room.startDate;
    room.endDate = endDate || room.endDate;

    if (req.files && req.files["productImage"]) {
      const imageFileNames = req.files.productImage.map(
        (file) => `/uploads/${file.filename}`
      );
      room.images = [...room.images, ...imageFileNames];
    }

    await room.save();

    res
      .status(HTTP_STATUS.OK)
      .send({ success: true, message: "Room updated successfully", room });
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomsByOwner,
  updateRoom,
};
