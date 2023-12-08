const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const moment = require("moment");
const {
  successResponse,
  errorResponse,
  customUserQuery,
} = require("../utils/functions");
const Constants = require("../utils/constants");

//admin
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: Constants.MISSING_FIELDS });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: Constants.EMAIL_IN_USE });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();
    return res
      .status(201)
      .json({ message: Constants.CREATED_SUCCESSFULLY, user: savedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: Constants.INTERNAL_ERROR });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 404, Constants.NOT_FOUND);
    }

    return successResponse(res, Constants.RETRIEVED_SUCCESSFULLY, { user });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return successResponse(res, Constants.RETRIEVED_SUCCESSFULLY, { users });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.updateUsers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, email, password } = req.body;
    const updatedAt = moment();
    const updatedBy = userId;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, password, updatedAt, updatedBy },
      { new: true }
    );

    if (!updatedUser) {
      return errorResponse(res, 404, Constants.NOT_FOUND);
    }

    return successResponse(res, Constants.UPDATED_SUCCESSFULLY, {
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.deleteUsers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedUser) {
      return errorResponse(res, 404, Constants.NOT_FOUND);
    }

    return successResponse(res, Constants.DELETED_SUCCESSFULLY);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.customUserQueryy = async (req, res) => {
  const { page = 1, limit = 10, sort, search } = req.query;

  try {
    const result = await customUserQuery(page, limit, sort, search);
    return successResponse(res, Constants.RETRIEVED_SUCCESSFULLY, result);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

//for public use only
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return errorResponse(res, 409, Constants.EMAIL_IN_USE);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    return res
      .status(201)
      .json({ message: Constants.REGISTERED_SUCCESSFULLY, user: savedUser });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    const token = jwt.sign({ sub: user._id }, process.env.TOP_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    return successResponse(res, Constants.LOGGED_IN_SUCCESSFULLY, { token });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "error ");
  }
};

exports.home = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
};
