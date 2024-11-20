const { success, failure } = require("../utilities/common");
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const UserModel = require("../model/user.model");
const Notification = require("../model/notification.model");

const getAllUsers = async (req, res) => {
  try {
    const user = await UserModel.find({}).select("-__v");

    if (user) {
      return res.status(HTTP_STATUS.OK).send(
        success("Successfully received all users", {
          result: user,
        })
      );
    } else {
      return res.status(HTTP_STATUS.OK).send("data could not be fetched");
    }
  } catch (error) {
    return res.status(400).send(`internal server error`);
  }
};

const getAllOwners = async (req, res) => {
  try {
    let { search, page, limit } = req.query;
    if (page < 1 || limit < 0) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure("Page and limit values must be at least 1"));
    }
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const query = { role: { $in: ["owner"] } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const users = await UserModel.find(query)
      .select("-__v")
      .skip((page - 1) * limit)
      .limit(limit * 1);
    const total = await UserModel.countDocuments(query);
    if (users.length) {
      return res.status(HTTP_STATUS.OK).send(
        success("Successfully received all owners", {
          result: users,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        })
      );
    }
    return res.status(HTTP_STATUS.OK).send(failure("owners not found"));
  } catch (error) {
    return res.status(400).send(`internal server error`);
  }
};

const getAllGuests = async (req, res) => {
  try {
    let { search, page, limit } = req.query;
    if (page < 1 || limit < 0) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure("Page and limit values must be at least 1"));
    }
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const query = { role: { $in: ["guest"] } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const guests = await UserModel.find(query)
      .select("-__v")
      .skip((page - 1) * limit)
      .limit(limit * 1);
    const total = await UserModel.countDocuments(query);
    if (guests.length) {
      return res.status(HTTP_STATUS.OK).send(
        success("Successfully received all guests", {
          result: guests,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        })
      );
    }
    return res.status(HTTP_STATUS.OK).send(failure("guest not found"));
  } catch (error) {
    return res.status(400).send(`internal server error`);
  }
};

const getOneUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.find({ _id: id });
    if (!user.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User was not found"));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully got the user", user[0]));
  } catch (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send(`internal server error`);
  }
};

const profile = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User not logged in"));
    }
    const user = await UserModel.findById(req.user._id)
      .select("-password")
      .populate("reservations")
      .populate("properties");

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User was not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully got profile", user));
  } catch (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send(`internal server error`);
  }
};

const updateUserById = async (req, res) => {
  try {
    // const validation = validationResult(req).array();

    // if (validation.length > 0) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to update data", validation[0].msg));
    // }

    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send({ message: "please provide id parameter" });
    }

    // const updatedUserData = req.body;
    const { firstName, lastName, phone } = req.body;

    // const user = await UserModel.findById(req.user._id);
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send({ message: "User not found" });
    }

    console.log("files", req.files);
    console.log("files", req.files["image"]);

    if (req.files && req.files["image"]) {
      let imageFileName = "";
      if (req.files.image[0]) {
        // Add public/uploads link to the image file

        imageFileName = `public/uploads/images/${req.files.image[0].filename}`;
        user.image = imageFileName;
      }
    }

    user.firstName = firstName || user.name;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;

    await user.save();

    return res
      .status(HTTP_STATUS.ACCEPTED)
      .send(success("User data updated successfully", user));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ message: "INTERNAL SERVER ERROR" });
  }
};

const updateProfileByUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, image } = req.body;
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send({ message: "User not found" });
    }

    if (req.files && req.files["image"]) {
      let imageFileName = "";
      if (req.files.image[0]) {
        // Add public/uploads link to the image file

        imageFileName = `public/uploads/images/${req.files.image[0].filename}`;
        user.image = imageFileName;
      }
    }
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.fullName = `${user.firstName} ${user.lastName}`;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    await user.save();
    return res
      .status(HTTP_STATUS.ACCEPTED)
      .send(success("Profile updated successfully", user));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ message: "INTERNAL SERVER ERROR" });
  }
};

// Controller to get notifications by userId
const getNotificationsByUserId = async (req, res) => {
  try {
    // const { userId } = req.body;
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide userId"));
    }

    // Fetch the user to check if they exist
    // const user = await UserModel.findById(userId).populate("notifications");
    const notifications = await Notification.find({
      applicant: userId,
    }).populate("applicant");

    if (!notifications) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("no notifications found"));
    }
    // Return the user's notifications
    res.status(HTTP_STATUS.OK).send({
      message: "Notifications fetched successfully",
      // notifications: user.notifications,
      notifications: notifications,
    });
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

// Controller to get notifications
const getAllNotifications = async (req, res) => {
  try {
    // Fetch the user to check if they exist
    const notifications = await Notification.find();

    if (!notifications) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("notification does not exist"));
    }

    res.status(HTTP_STATUS.OK).send({
      message: "All Notifications fetched successfully",
      notifications: notifications,
    });
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const notificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide notificationId"));
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        $set: {
          isRead: true,
        },
      },
      { new: true }
    );

    if (!notification) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Notification does not exist"));
    }

    res.status(HTTP_STATUS.OK).send({
      message: "Notification read successfully",
      notification: notification,
    });
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  getAllOwners,
  getAllGuests,
  getOneUserById,
  getNotificationsByUserId,
  getAllNotifications,
  notificationRead,
  updateUserById,
  profile,
  updateProfileByUser,
};
