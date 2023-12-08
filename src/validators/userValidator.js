const { body, validationResult } = require("express-validator");
const Constants = require("../utils/constants");

const validateCreateUser = [
  // body("username")
  //   .trim()
  //   .isLength({ min: 0 })
  //   .withMessage(Constants.USERNAME_MIN_LENGTH),
  // body("email")
  //   .isEmail()
  //   .withMessage(Constants.INVALID_EMAIL)
  //   .custom(async (value) => {
  //     const existingUser = await User.findOne({ email: value });
  //     if (existingUser) {
  //       throw new Error(Constants.EMAIL_IN_USE);
  //     }
  //     return true;
  //   }),
  // body("password")
  //   .notEmpty()
  //   .withMessage(Constants.PASSWORD_NOT_EMPTY)
  //   .isLength({ min: 6 })
  //   .withMessage(Constants.PASSWORD_MIN_LENGTH),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorResponse = {};
    errors.array().forEach((error) => {
      errorResponse[error.param] = error.msg;
    });
    return res.status(400).json({ errors: errorResponse });
  }
  next();
};

module.exports = {
  validateCreateUser,
  handleValidationErrors,
};
