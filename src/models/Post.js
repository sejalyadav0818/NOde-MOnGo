const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

// Middleware to automatically set createdBy  fields with this pre filed it check  conditions first and then go further
postSchema.pre("save", async function (next) {
  try {
    if (!this.createdBy) {
      this.createdBy = this.user;
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
