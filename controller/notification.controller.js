const User = require("../model/User");
const HTTP_STATUS = require("../constants/statusCodes");

// Controller to get notifications by userId
const getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide userId"));
    }

    // Fetch the user to check if they exist
    const user = await User.findById(userId).populate("notifications");

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User does not exist"));
    }
    // Return the user's notifications
    res.status(HTTP_STATUS.OK).send({
      message: "Notifications fetched successfully",
      notifications: user.notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getNotificationsByUserId,
};
