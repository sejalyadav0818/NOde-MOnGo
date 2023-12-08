const { body, validationResult } = require("express-validator");
const Constants = require("../utils/constants");

const validateCreatePost = [
  body("title").isLength({ min: 3 }).withMessage(Constants.TITLE_MIN_LENGTH),
  body("content").notEmpty().withMessage(Constants.CONTENT_NOT_EMPTY),
  body("username")
    .isLength({ min: 3 })
    .withMessage(Constants.USERNAME_MIN_LENGTH),
  body("email").isEmail().withMessage(Constants.INVALID_EMAIL),
  body("password")
    .notEmpty()
    .withMessage(Constants.PASSWORD_NOT_EMPTY)
    .isLength({ min: 6 })
    .withMessage(Constants.PASSWORD_MIN_LENGTH),
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
  validateCreatePost,
  handleValidationErrors,
};
