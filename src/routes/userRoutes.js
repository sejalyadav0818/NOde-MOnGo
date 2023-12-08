const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const userValidator = require("../validators/userValidator");

//for admin
router.post(
  "/create-user",
  userValidator.validateCreateUser,
  userValidator.handleValidationErrors,
  userController.createUser
);

router.get("/get-user/:userId", userController.getUserById);

router.get("/get-users", userController.getUsers);

router.put(
  "/update-user/:userId",
  userValidator.validateCreateUser,
  userValidator.handleValidationErrors,
  userController.updateUsers
);

router.delete(
  "/delete-user/:userId",
  userValidator.validateCreateUser,
  userValidator.handleValidationErrors,
  userController.deleteUsers
);

router.get("/customUserQuery", userController.customUserQueryy);

//for public
router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/home", authMiddleware.authenticate(), userController.home);

module.exports = router;
