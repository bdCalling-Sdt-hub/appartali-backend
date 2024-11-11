const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { success, failure, generateRandomCode } = require("../utilities/common");
const User = require("../model/user.model");
const Notification = require("../model/notification.model");
const HTTP_STATUS = require("../constants/statusCodes");
const { emailWithNodemailerGmail } = require("../config/email.config");

const signup = async (req, res) => {
  try {
    const validation = validationResult(req).array();
    if (validation.length > 0) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to register", validation[0].msg));
    }
    const { firstName, lastName, email, password, phone } = req.body;
    if (req.body.role === "admin") {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`Admin cannot be signed up`));
    }

    const emailCheck = await User.findOne({ email });

    if (emailCheck && !emailCheck.emailVerified) {
      const emailVerifyCode = generateRandomCode(4); //4 digits
      emailCheck.emailVerifyCode = emailVerifyCode;
      await emailCheck.save();

      const emailData = {
        email: emailCheck.email,
        subject: "Account Activation Email",
        html: `
                      <h1>Hello, ${emailCheck?.firstName || "User"}</h1>
                      <p>Your email verification code is <h3>${emailVerifyCode}</h3></p>
                      
                    `,
      };
      emailWithNodemailerGmail(emailData);

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Already registered, Please verify your email"));
    }

    if (emailCheck) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`User with email: ${email} already exists`));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailVerifyCode = generateRandomCode(4); //4 digits

    console.log("emailVerifyCode", emailVerifyCode);

    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`,
      email: email,
      password: hashedPassword,
      emailVerifyCode,
      phone: phone,
    });

    // payload, secret, JWT expiration
    // const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // })

    const emailData = {
      email: email,
      subject: "Account Activation Email",
      html: `
                  <h1>Hello, ${newUser?.firstName || "User"}</h1>
                  <p>Your email verification code is <h3>${emailVerifyCode}</h3></p>
                  
                `,
    };

    emailWithNodemailerGmail(emailData);

    const token = jwt.sign(newUser.toObject(), process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.setHeader("Authorization", token);
    if (newUser) {
      return res
        .status(HTTP_STATUS.OK)
        .send(success("Account created successfully ", { newUser, token }));
    }
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send(failure("Account couldnt be created"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};

const signupAsOwner = async (req, res) => {
  try {
    const validation = validationResult(req).array();
    if (validation.length > 0) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to register", validation[0].msg));
    }
    const { firstName, lastName, email, password, phone } = req.body;
    const emailCheck = await User.findOne({ email });

    const admin = await User.findOne({ role: "admin" });

    // if (!admin) {
    //   return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Admin not found"));
    // }

    if (emailCheck && emailCheck.ownerApplicationStatus === "pending") {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`${email} has already applied for the owner's position`));
    }

    if (
      emailCheck &&
      (emailCheck.isOwner === true ||
        emailCheck.ownerApplicationStatus === "approved")
    ) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`${email} is already an owner`));
    }

    if (emailCheck) {
      emailCheck.ownerApplicationStatus = "pending";

      const emailVerifyCode = generateRandomCode(4); //4 digits

      emailCheck.emailVerifyCode = emailVerifyCode;
      const emailData = {
        email: emailCheck.email,
        subject: "Owner Application Email",
        html: `
                        <h6>Hello, ${emailCheck?.firstName || "User"}</h6>
                        <p>Congrats, you have successfully applied to become an investor</p>
                        <p>Your email verification code is <strong>${emailVerifyCode}</strong></p>
                        <p>Please wait for admin's approval</p>
                      `,
      };
      emailWithNodemailerGmail(emailData);

      await emailCheck.save();

      const newNotification = await Notification.create({
        applicant: emailCheck._id,
        admin: admin._id || null,
        status: "pending",
        message: `${emailCheck.email} has applied for the owner's role.`,
      });

      if (!newNotification) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Could not send notification"));
      }

      emailCheck.notifications.push(newNotification._id);
      await emailCheck.save();

      if (admin) {
        admin.notifications.push(newNotification._id);
        await admin.save();
      }

      return res.status(HTTP_STATUS.OK).send(
        success("You have successfully applied for the owner's position", {
          user: emailCheck,
        })
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`,
      email: email,
      password: hashedPassword,
      ownerApplicationStatus: "pending",
      phone: phone,
    });

    if (!newUser) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Account couldnt be created"));
    }

    const emailVerifyCode = generateRandomCode(4); //4 digits
    newUser.emailVerifyCode = emailVerifyCode;
    await newUser.save();
    const emailData = {
      email: email,
      subject: "Investor Application Successful Email",
      html: `
              <h1>Hello, ${newUser?.firstName || "User"}</h1>
              <p>Congrats, you have successfully applied to become an investor</p>
              <p>Your email verification code is <h3>${emailVerifyCode}</h3></p>      
              `,
    };
    emailWithNodemailerGmail(emailData);

    const newNotification = await Notification.create({
      applicant: newUser._id,
      admin: admin._id || null,
      status: "pending",
      message: `${newUser.email} has applied for the doctor role.`,
    });

    if (!newNotification) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Could not send notification"));
    }

    newUser.notifications.push(newNotification._id);
    await newUser.save();

    if (admin) {
      admin.notifications.push(newNotification._id);
      await admin.save();
    }

    res.status(HTTP_STATUS.OK).send(
      success("Account created successfully & applied for owner's position", {
        user: newUser,
      })
    );
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, emailVerifyCode } = req.body;

    if (!email || !emailVerifyCode) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email and verification code"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User does not exist"));
    }

    if (user.emailVerifyCode !== emailVerifyCode) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Invalid verification code"));
    }

    user.emailVerified = true;
    user.emailVerifyCode = null;
    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Email verified successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};

const becomeAnInvestor = async (req, res) => {
  try {
    // const validation = validationResult(req).array();
    // if (validation.length > 0) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to register", validation[0].msg));
    // }
    const { email, phone, location, rooms } = req.body;
    const emailCheck = await User.findOne({ email });
    if (!emailCheck) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please sign up first"));
    }
    if (emailCheck && emailCheck.investorApplicationStatus === "pending") {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(
          failure(`${email} has already applied for the investor's position`)
        );
    }

    if (
      emailCheck &&
      (emailCheck.isInvestor === true ||
        emailCheck.investorApplicationStatus === "approved")
    ) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`${email} is already an investor`));
    }

    if (emailCheck) {
      emailCheck.investorApplicationStatus = "pending";
      emailCheck.location = location;
      emailCheck.rooms = rooms;
      emailCheck.phone = phone;

      const emailVerifyCode = generateRandomCode(4); //4 digits

      emailCheck.emailVerifyCode = emailVerifyCode;
      const emailData = {
        email: emailCheck.email,
        subject: "Investor Application Email",
        html: `
                        <h1>Hello, ${emailCheck?.firstName || "User"}</h1>
                        <p>Congrats, you have successfully applied to become an investor</p>
                        <p>Your email verification code is <strong>${emailVerifyCode}</strong></p>
                        <p>Please wait for admin's approval</p>
                      `,
      };
      emailWithNodemailerGmail(emailData);

      await emailCheck.save();

      const newNotification = await Notification.create({
        applicant: emailCheck._id,
        admin: null,
        status: "pending",
        message: `${emailCheck.email} has applied for the investor's role.`,
      });

      if (!newNotification) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Could not send notification"));
      }

      emailCheck.notifications.push(newNotification._id);
      await emailCheck.save();

      return res.status(HTTP_STATUS.OK).send(
        success("You have successfully applied for the investor's position", {
          user: emailCheck,
        })
      );
    }
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};

const approveOwner = async (req, res) => {
  try {
    const { ownerId } = req.body; // OwnerId of the user who applied

    if (!ownerId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide ownerId"));
    }

    if (!req.user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized! Admin access only"));
    }

    const owner = await User.findById(ownerId);
    const admin = await User.findOne({ email: req.user.email });

    if (!owner) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User does not exist"));
    }

    const existingOwner = await User.findOne({
      email: owner.email,
      role: "owner",
    });

    if (existingOwner) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User is already an owner"));
    }

    owner.ownerApplicationStatus = "approved";
    owner.isOwner = true;
    owner.role.push("owner");
    await owner.save();

    const emailData = {
      email: owner.email,
      subject: "Application Approved - Welcome to Our Platform!",
      html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Congratulations, ${
                  owner.firstName || "Dear Invesor"
                }!</h2>
                <p>We are delighted to inform you that your application to become an investor on our platform has been <strong>approved</strong>.</p>
                
                <p>You are now able to post your property listings and offer services directly to our users. We appreciate your decision to partner with us and look forward to your success on our platform.</p>
                
                <p>Here are the next steps to get started:</p>
                <ul>
                  <li>Log in to your account and complete your profile.</li>
                  <li>Explore the property owner’s dashboard to manage your listings and services.</li>
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

    // Create a new notification for the admin Owner
    const newNotification = await Notification.create({
      applicant: owner._id,
      admin: admin._id,
      status: "approved",
      message: `your application has been approved.`,
    });

    if (!newNotification) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Could not send notification"));
    }

    if (!owner.notifications.includes(newNotification._id)) {
      owner.notifications.push(newNotification._id);
    }
    await owner.save();

    if (!admin.notifications.includes(newNotification._id)) {
      admin.notifications.push(newNotification._id);
    }
    await admin.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Owner application approved", owner));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to approve Owner"));
  }
};

const cancelOwner = async (req, res) => {
  try {
    const { ownerId } = req.body;

    if (!ownerId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide ownerId"));
    }

    if (!req.user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized! Admin access only"));
    }

    const owner = await User.findById(ownerId);
    const admin = await User.findOne({ email: req.user.email });

    if (!owner) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("owner not found"));
    }

    if (
      owner.ownerApplicationStatus === "cancelled" ||
      owner.ownerApplicationStatus === "notApplied"
    ) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User did not apply for owner's position yet"));
    }

    owner.ownerApplicationStatus = "cancelled";
    owner.isOwner = false;
    owner.role = owner.role.filter((role) => role != "owner");
    await owner.save();

    const emailData = {
      email: owner.email,
      subject: "Application Update - Request to Become an Investor",
      html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #FF6F61;">Application Status Update</h2>
              <p>Dear ${owner.firstName || "Applicant"},</p>
              
              <p>Thank you for your interest in becoming an investor on our platform. After careful consideration, we regret to inform you that your application was not approved at this time.</p>
              
              <p>We encourage you to review our application guidelines and policies, as you are welcome to reapply in the future should your circumstances change.</p>
              
              <p>If you have any questions about the decision or our platform, please feel free to reach out. We appreciate your understanding and thank you for your interest in partnering with us.</p>
              
              <p>Warm regards,<br/>
              <strong>Appartali</strong><br/>
              <a href="mailto:support@appartali.com">support@appartali.com</a></p>
            </body>
          </html>
        `,
    };
    emailWithNodemailerGmail(emailData);

    await owner.save();

    // Create a new notification for the admin doctor
    const newNotification = await Notification.create({
      applicant: owner._id,
      admin: admin._id,
      status: "cancelled",
      message: `your application has been cancelled.`,
    });

    if (!newNotification) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Could not send notification"));
    }

    owner.notifications.push(newNotification._id);
    await owner.save();

    admin.notifications.push(newNotification._id);
    await admin.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Owner application cancelled", owner));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to cancel doctor"));
  }
};

const login = async (req, res) => {
  try {
    const validation = validationResult(req).array();
    if (validation.length > 0) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to login", validation[0].msg));
    }
    const { email, password } = req.body;

    // fetching the fields
    const user = await User.findOne({ email }).select("+password");

    // when the user doesnt exist or pass dont match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("wrong email or password"));
    }

    // token
    const token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // deleting unnecessary fields
    user.password = undefined;

    res.setHeader("Authorization", token);
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Logged in successfully", { user, token }));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const loginAsOwner = async (req, res) => {
  try {
    const validation = validationResult(req).array();
    if (validation.length > 0) {
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to login", validation[0].msg));
    }
    const { email, password } = req.body;

    // fetching the fields
    const user = await User.findOne({ email }).select("+password");

    // when the user doesnt exist or pass dont match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("wrong email or password"));
    }

    if (user.ownerApplicationStatus === "pending") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(
          failure("Your account is not approved yet. Please wait for approval")
        );
    }

    if (user.ownerApplicationStatus === "cancelled") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(
          failure("Your request has been cancelled. Please try again later")
        );
    }

    // token
    const token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.setHeader("Authorization", token);
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Logged in successfully", { user, token }));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const loginSocial = async (req, res) => {
  try {
    // const validation = validationResult(req).array();
    // if (validation.length > 0) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to login", validation[0].msg));
    // }
    const { email, firstName, lastName, image, phone } = req.body;
    console.log("image", image);

    // fetching the fields
    let user = await User.findOne({ email }).select("+password");

    // when the user doesnt exist
    if (!user) {
      user = await User.create({
        email,
        firstName,
        lastName,
        image,
        phone,
        loginType: "social",
      });
    }

    const token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.setHeader("Authorization", token);
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Logged in successfully", { user, token }));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token) {
      // No token means user is not logged in
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("You are not logged in"));
    }
    console.log("after reset", res);
    return res.status(HTTP_STATUS.OK).send(success("Logged out successfully"));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Logout failed"));
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User with this email does not exist"));
    }
    const emailVerifyCode = generateRandomCode(4);

    user.emailVerifyCode = emailVerifyCode;
    user.emailVerified = false;
    await user.save();

    const emailData = {
      email,
      subject: "Password Reset Email",
      html: `
        <h1>Hello, ${user.firstName || "User"}</h1>
        <p>Use this code <h3>${emailVerifyCode}</h3> to reset your password</p>
        
      `,
    };
    await emailWithNodemailerGmail(emailData);
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Verification code sent successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email, password and confirm password"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User with this email does not exist"));
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Password and confirm password do not match"));
    }

    if (!user.emailVerified) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please verify your email first"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.emailVerifyCode = null;

    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Password reset successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(
          failure(
            "Please provide email, old password, new password and confirm password"
          )
        );
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("New password and confirm password do not match"));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User with this email does not exist"));
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Old password is incorrect"));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Password changed successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};
module.exports = {
  signup,
  signupAsOwner,
  becomeAnInvestor,
  approveOwner,
  cancelOwner,
  login,
  loginSocial,
  loginAsOwner,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};
