const { body, param } = require("express-validator");

const roomValidator = {
  create: [
    body("category")
      .exists()
      .withMessage("category was not provided")
      .bail()
      .notEmpty()
      .withMessage("category cannot be empty")
      .bail()
      .isString()
      .withMessage("category must be a string"),
    body("location")
      .exists()
      .withMessage("location was not provided")
      .bail()
      .notEmpty()
      .withMessage("location cannot be empty")
      .bail()
      .isString()
      .withMessage("location must be a string"),
    body("roomCount")
      .exists()
      .withMessage("roomCount was not provided")
      .bail()
      .notEmpty()
      .withMessage("roomCount cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("roomCount must be a positive integer and bigger than 0"),
    body("description")
      .exists()
      .withMessage("description was not provided")
      .bail()
      .notEmpty()
      .withMessage("description cannot be empty")
      .bail()
      .isString()
      .withMessage("description must be a string"),
    body("pricePerNight")
      .exists()
      .withMessage("pricePerNight was not provided")
      .bail()
      .notEmpty()
      .withMessage("pricePerNight cannot be empty")
      .bail()
      .isFloat({ min: 1 })
      .withMessage("pricePerNight must be a number bigger than 0"),
    body("maxGuests")
      .exists()
      .withMessage("maxGuests was not provided")
      .bail()
      .notEmpty()
      .withMessage("maxGuests cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("maxGuests must be a positive integer and bigger than 0"),
    body("startDate")
      .exists()
      .withMessage("startDate was not provided")
      .bail()
      .notEmpty()
      .withMessage("startDate cannot be empty")
      .bail()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("Invalid start date format (YYYY-MM-DD)"),
    body("endDate")
      .exists()
      .withMessage("endDate was not provided")
      .bail()
      .notEmpty()
      .withMessage("endDate cannot be empty")
      .bail()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("Invalid end date format (YYYY-MM-DD)"),
  ],
  update: [
    body("category")
      .optional()
      .exists()
      .withMessage("category was not provided")
      .bail()
      .notEmpty()
      .withMessage("category cannot be empty")
      .bail()
      .isString()
      .withMessage("category must be a string"),
    body("location")
      .optional()
      .exists()
      .withMessage("location was not provided")
      .bail()
      .notEmpty()
      .withMessage("location cannot be empty")
      .bail()
      .isString()
      .withMessage("location must be a string"),
    body("roomCount")
      .optional()
      .exists()
      .withMessage("roomCount was not provided")
      .bail()
      .notEmpty()
      .withMessage("roomCount cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("roomCount must be a positive integer and bigger than 0"),
    body("description")
      .optional()
      .exists()
      .withMessage("description was not provided")
      .bail()
      .notEmpty()
      .withMessage("description cannot be empty")
      .bail()
      .isString()
      .withMessage("description must be a string"),
    body("pricePerNight")
      .optional()
      .exists()
      .withMessage("pricePerNight was not provided")
      .bail()
      .notEmpty()
      .withMessage("pricePerNight cannot be empty")
      .bail()
      .isFloat({ min: 1 })
      .withMessage("pricePerNight must be a number bigger than 0"),
    body("maxGuests")
      .optional()
      .exists()
      .withMessage("maxGuests was not provided")
      .bail()
      .notEmpty()
      .withMessage("maxGuests cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("maxGuests must be a positive integer and bigger than 0"),
    body("startDate")
      .optional()
      .exists()
      .withMessage("startDate was not provided")
      .bail()
      .notEmpty()
      .withMessage("startDate cannot be empty")
      .bail()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("Invalid start date format (YYYY-MM-DD)"),
    body("endDate")
      .optional()
      .exists()
      .withMessage("endDate was not provided")
      .bail()
      .notEmpty()
      .withMessage("endDate cannot be empty")
      .bail()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("Invalid end date format (YYYY-MM-DD)"),
  ],
  delete: [
    param("id")
      .exists()
      .withMessage("Product ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
  ],
};

const userValidator = {
  create: [
    body("firstName")
      .optional()
      .exists()
      .withMessage("firstName was not provided")
      .bail()
      .notEmpty()
      .withMessage("firstName cannot be empty")
      .bail()
      .isString()
      .withMessage("firstName must be a string"),
    body("lastName")
      .optional()
      .exists()
      .withMessage("lastName was not provided")
      .bail()
      .notEmpty()
      .withMessage("lastName cannot be empty")
      .bail()
      .isString()
      .withMessage("lastName must be a string"),
    body("email")
      .optional()
      .exists()
      .withMessage("Email was not provided")
      .bail()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email format is incorrect"),
    body("password")
      .optional()

      .exists()
      .withMessage("Password was not provided")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .bail()
      .isStrongPassword({
        minLength: 5,
        // minNumbers: 1,
        // minLowercase: 1,
        // minUppercase: 1,
        // minSymbols: 1,
      })
      .withMessage("Password must be at least 5 characters long "),

    body("phone")
      .optional()
      .exists()
      .withMessage("Phone number was not provided")
      .bail()
      .notEmpty()
      .withMessage("Phone number cannot be empty")
      .bail()
      .isString()
      .withMessage("Phone number must be a string")
      .bail()
      .isMobilePhone()
      .withMessage("Phone number format is incorrect"),
    body("gender")
      .isIn(["male", "female", "other"])
      .withMessage("Gender must be male, female or other"),
    body("address.area")
      .optional()
      .exists()
      .withMessage("area was not provided")
      .bail()
      .notEmpty()
      .withMessage("area cannot be empty")
      .bail()
      .isString()
      .withMessage("area must be a string"),
    body("address.city")
      .optional()
      .exists()
      .withMessage("city was not provided")
      .bail()
      .notEmpty()
      .withMessage("city cannot be empty")
      .bail()
      .isString()
      .withMessage("city must be a string"),
    body("address.country")
      .optional()
      .exists()
      .withMessage("country was not provided")
      .bail()
      .notEmpty()
      .withMessage("country cannot be empty")
      .bail()
      .isString()
      .withMessage("country must be a string"),
    body("balance")
      .isFloat({ min: 0, max: 1500 })
      .withMessage("balance must be grater than 0 and less than 1500"),
  ],
  update: [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Name is required")
      .bail()
      .isString()
      .withMessage("name must be a string"),
    body("email")
      .optional()
      .notEmpty()
      .withMessage("email is required")
      .bail()
      .isString()
      .withMessage("email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email format is incorrect"),
    body("phone")
      .optional()
      .notEmpty()
      .withMessage("phone number cannot be empty")
      .bail()
      .isString()
      .withMessage("phone number must be a string")
      .bail()
      .isMobilePhone()
      .withMessage("Phone number format is incorrect"),
    body("gender")
      .optional()
      .notEmpty()
      .withMessage("gender cannot be empty")
      .bail()
      .isIn(["male", "female", "other"])
      .withMessage("Gender must be male, female or other"),
    body("address.area")
      .optional()
      .notEmpty()
      .withMessage("area cannot be empty")
      .bail()
      .isString()
      .withMessage("area must be a string"),
    body("address.city")
      .optional()
      .notEmpty()
      .withMessage("city cannot be empty")
      .bail()
      .isString()
      .withMessage("area must be a string"),
    body("address.country")
      .optional()
      .notEmpty()
      .withMessage("country cannot be empty")
      .bail()
      .isString()
      .withMessage("area must be a string"),
    body("balance")
      .optional()
      .isFloat({ min: 0, max: 1500 })
      .withMessage("balance must be greater than 0 and less than 1500"),
  ],
  delete: [
    param("id")
      .exists()
      .withMessage("User ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
  ],
};

const authValidator = {
  create: [
    body("firstName")
      .exists()
      .withMessage("first name was not provided")
      .bail()
      .notEmpty()
      .withMessage("first name cannot be empty")
      .bail()
      .isString()
      .withMessage("first name must be a string"),
    body("lastName")
      .exists()
      .withMessage("last name was not provided")
      .bail()
      .notEmpty()
      .withMessage("last name cannot be empty")
      .bail()
      .isString()
      .withMessage("last name must be a string"),
    body("email")
      .exists()
      .withMessage("Email was not provided")
      .bail()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email format is incorrect"),
    body("password")
      .exists()
      .withMessage("Password was not provided")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .bail()
      .isStrongPassword({
        minLength: 5,
        minNumbers: 0,
        minLowercase: 0,
        minUppercase: 0,
        minSymbols: 0,
      })
      .withMessage("Password must contain 5 characters"),
    body("phone")
      .exists()
      .withMessage("phone number was not provided")
      .bail()
      .isString()
      .withMessage("phone number must be a string")
      .bail()
      .isMobilePhone()
      .withMessage("Phone number format is incorrect"),
    // body("passwordConfirm")
    //   .exists()
    //   .withMessage("Confirm Password was not provided")
    //   .bail()
    //   .isString()
    //   .withMessage("Password must be a string")
    //   .bail()
    //   .custom((value, { req }) => {
    //     if (value !== req.body.password) {
    //       throw new Error("Passwords do not match");
    //     }
    //     return true;
    //   }),
    body("role")
      .optional()
      .isIn(["guest", "owner", "admin"])
      .withMessage("Role must be guest, owner or admin"),
  ],
  login: [
    body("email")
      .exists()
      .withMessage("Email was not provided")
      .bail()
      .isEmail()
      .withMessage("Email format is incorrect")
      .bail()
      .notEmpty()
      .withMessage("Email cannot be empty"),
    body("password")
      .exists()
      .withMessage("Password was not provided")
      .bail()
      .notEmpty()
      .withMessage("password cannot be empty")
      .bail()
      .isString()
      .withMessage("Password must be a string"),
  ],
};

const reviewValidator = {
  addReview: [
    param("id")
      .exists()
      .withMessage("User ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
    body("productId")
      .exists()
      .withMessage("Product ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
    body("review")
      .exists()
      .withMessage("Review must be provided")
      .bail()
      .isString()
      .withMessage("Review has to be a string"),
    body("rating")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be a number between 1 and 5"),
  ],
  updateReview: [
    param("id")
      .exists()
      .withMessage("User ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
    body("productId")
      .exists()
      .withMessage("Product ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
    body("review")
      .optional()
      .exists()
      .withMessage("Review must be provided")
      .bail()
      .isString()
      .withMessage("Review has to be a string"),
    body("rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be a number between 1 and 5"),
  ],
};

const discountValidator = {
  addDiscount: [
    body("productId")
      .exists()
      .withMessage("product ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
    body("startTime")
      .exists()
      .withMessage("startTime was not provided")
      .bail()
      .notEmpty()
      .withMessage("startTime cannot be empty")
      .isISO8601()
      .withMessage(
        'Invalid date-time format for start time. Use "YYYY-MM-DDT14:10:26.113Z" format.'
      ),
    body("endTime")
      .exists()
      .withMessage("endTime was not provided")
      .bail()
      .notEmpty()
      .withMessage("endTime cannot be empty")
      .isISO8601()
      .withMessage(
        'Invalid date-time format for end time. Use "YYYY-MM-DDT14:10:26.113Z" format.'
      ),
    body("percentage")
      .isFloat({ min: 1, max: 70 })
      .withMessage("discount percentage must be a number between 1 and 70"),
    body("title")
      .exists()
      .withMessage("title was not provided")
      .bail()
      .notEmpty()
      .withMessage("title cannot be empty")
      .bail()
      .isString()
      .withMessage("title must be a string"),
  ],

  updateDiscount: [
    body("productId")
      .optional()
      .exists()
      .withMessage("product ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
    body("startTime")
      .optional()
      .exists()
      .withMessage("startTime was not provided")
      .bail()
      .notEmpty()
      .withMessage("startTime cannot be empty"),
    body("endTime")
      .optional()
      .exists()
      .withMessage("endTime was not provided")
      .bail()
      .notEmpty()
      .withMessage("endTime cannot be empty"),
    body("percentage")
      .optional()
      .isFloat({ min: 1, max: 70 })
      .withMessage("discount percentage must be a number between 1 and 70"),
    body("title")
      .optional()
      .exists()
      .withMessage("title was not provided")
      .bail()
      .notEmpty()
      .withMessage("title cannot be empty")
      .bail()
      .isString()
      .withMessage("title must be a string"),
  ],

  id: [
    param("id")
      .exists()
      .withMessage("Discount ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
  ],
};

module.exports = {
  roomValidator,
  userValidator,
  authValidator,
  reviewValidator,
  discountValidator,
};
