const { validationResult } = require("express-validator");
const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");
const Property = require("../model/property.model");
const { emailWithNodemailerGmail } = require("../config/email.config");
const User = require("../model/user.model");
const Notification = require("../model/notification.model");

const createProperty = async (req, res) => {
  try {
    console.log(req?.body);
    const validation = validationResult(req).array();
    if (validation.length) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to add property", validation[0].msg));
    }
    const userId = req.user._id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("please login first", "User not found"));
    }

    const owner = await User.findById(userId);

    if (!owner) {
      return res.status(HTTP_STATUS.OK).send(failure("User not found"));
    }
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Admin not found"));
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
      services,
      endDate,
    } = req.body;

    const newProperty = new Property({
      category,
      location,
      roomCount,
      description,
      pricePerNight,
      maxGuests,
      services: [services],
      startDate,
      endDate,
      owner: userId,
      images: image && image.length ? image : [],
    });

    if (!newProperty) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to add property", "error in adding property"));
    }

    if (req.files && req.files["productImage"]) {
      const imageFileNames = req.files.productImage.map(
        (file) => `public/uploads/images/${file.filename}`
      );
      newProperty.images = [...newProperty.images, ...imageFileNames];
    }

    // Convert newProperty._id to a six-digit number string

    newProperty.roomId = newProperty._id.toString().slice(-6).padStart(6, "0");

    const property = await newProperty.save();
    const emailData = {
      email: owner.email,
      subject: "Property Application Email",
      html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello, ${owner?.firstName || "User"}</h2>
                <p>Your application to add a property as a service has been successfully received.</p>
                <p>We are currently reviewing your request. You will be notified once a decision has been made.</p>
                <p>We appreciate your interest in collaborating with us.</p>
                <p>Best regards,<br/> <strong>Team Appartali </strong></p>
              </body>
            </html>
            `,
    };
    emailWithNodemailerGmail(emailData);

    const newNotification = await Notification.create({
      applicant: owner._id || null,
      admin: admin._id || null,
      status: "pending",
      message: `${owner.email} has applied for adding a property.`,
    });

    if (!newNotification) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Could not send notification"));
    }

    owner.notifications.push(newNotification._id);
    owner.properties.push(property._id);
    await owner.save();

    if (admin) {
      admin.notifications.push(newNotification._id);
      await admin.save();
    }
    res
      .status(HTTP_STATUS.CREATED)
      .send(success("Applied for property successfully", property));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const { location, maxGuests, startDate, endDate } = req.query;

    const query = {
      location: new RegExp(location, "i"),
    };
    if (maxGuests) {
      query.maxGuests = { $gte: parseInt(maxGuests) };
    }
    if (startDate && endDate) {
      query.startDate = { $lte: new Date(endDate), $gte: new Date(startDate) };
      query.endDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const properties = await Property.find(query).populate("owner");
    res.status(HTTP_STATUS.OK).send({
      success: true,
      message: "Rooms fetched successfully",
      properties,
    });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please provide room id" });
    }
    const room = await Property.findById(req.params.id).populate("owner");
    res
      .status(HTTP_STATUS.OK)
      .send({ success: true, message: "Room fetched successfully", room });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const getPropertyByOwner = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please login first" });
    }
    const rooms = await Property.find({ owner: req.user._id }).populate(
      "owner"
    );
    res
      .status(HTTP_STATUS.OK)
      .send({ success: true, message: "Rooms fetched successfully", rooms });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const updateProperty = async (req, res) => {
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
    const room = await Property.findById(req.params.id);

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

const deletePropertyById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please provide room id" });
    }
    const room = await Property.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!room) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send({ success: false, message: "Room not found" });
    }
    res
      .status(HTTP_STATUS.OK)
      .send({ success: true, message: "Room deleted successfully", room });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const approvePropertyById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send({ success: false, message: "Please provide room id" });
    }
    const room = await Property.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).populate("owner");
    if (!room) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send({ success: false, message: "Room not found" });
    }
    const emailData = {
      email: room.owner.email,
      subject: "Property Application Approved",
      html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Congratulations, ${
                  room.owner?.firstName || "User"
                } 
                </h2>
                <p>We are delighted to inform you that your application for the property has been <strong>approved</strong>.</p>
                
                <p>You are now able to offer services directly to our users. We appreciate your decision to partner with us and look forward to your success on our platform.</p>
                
                <p>Here are the next steps to get started:</p>
                <ul>
                  <li>Log in to your account and complete your profile.</li>
                  <li>Explore the property owner’s profile to manage your listings and services.</li>
                  <li>Review our policies and guidelines to ensure a seamless experience.</li>
                </ul>

                <p>If you have any questions or need support, please don’t hesitate to reach out to us.</p>

                <p>Sincerely,<br/>
                <strong>Appartali</strong><br/>
                <a href="mailto:support@appartali.com">support@appartali.com</a></p>
              </body>
            </html>
                `,
    };

    emailWithNodemailerGmail(emailData);
    res
      .status(HTTP_STATUS.ACCEPTED)
      .send({ success: true, message: "Room approved successfully", room });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const cancelPropertyById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ success: false, message: "Please provide room id" });
    }
    const room = await Property.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    ).populate("owner");
    if (!room) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send({ success: false, message: "Room not found" });
    }
    const emailData = {
      email: room.owner.email,
      subject: "Property Application Cancelled",
      html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #FF6F61;">Application Status Update</h2>
              <p>Dear ${room.owner.firstName || "Applicant"},</p>
              
              <p>Thank you for your interest for adding a property in our platform. After careful consideration, we regret to inform you that your application was not approved at this time.</p>
              
              <p>If you have any questions about the decision or our platform, please feel free to reach out. </p>
              
              <p>Warm regards,<br/>
              <strong>Appartali</strong><br/>
              <a href="mailto:support@appartali.com">support@appartali.com</a></p>
            </body>
          </html>
        `,
    };
    emailWithNodemailerGmail(emailData);
    res
      .status(HTTP_STATUS.OK)
      .send({ success: true, message: "Room cancelled successfully", room });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

module.exports = {
  createProperty,
  approvePropertyById,
  cancelPropertyById,
  getAllProperties,
  getPropertyById,
  getPropertyByOwner,
  updateProperty,
  deletePropertyById,
};
