const Post = require("../models/Post");
const User = require("../models/User");
const moment = require("moment");
const Constants = require("../utils/constants");
const path = require("path");
const {
  successResponse,
  errorResponse,
  customPostQuery,
} = require("../utils/functions");

exports.createPost = async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: Constants.USER_ID_REQUIRED });
    }
    const baseUrl = process.env.BASE_URL;
    let image;
    let imageUrl;
    if (req.file) {
      const imageTimestamp = moment().format("YYYY-MM-DD-HH:mm:ss.SSS-a");
      image = req.file.buffer;
      const originalFileExtension = path.extname(req.file.originalname);
      imageUrl = `${baseUrl}/images/${imageTimestamp}${originalFileExtension}`;
    }

    const post = new Post({
      title,
      content,
      user: userId,
      image: imageUrl,
    });

    await post.save();
    await User.findByIdAndUpdate(
      userId,
      { $push: { posts: post._id } },
      { new: true }
    );

    res.status(201).json(post);
  } catch (error) {
    console.error(Constants.ERROR_CREATING_POST, error);
    res.status(500).json({ error: Constants.INTERNAL_ERROR });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ user: userId });

    return successResponse(res, Constants.RETRIEVED_SUCCESSFULLY, { posts });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    return successResponse(res, Constants.RETRIEVED_SUCCESSFULLY, { posts });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, content } = req.body;
    const updatedAt = moment();
    const updatedBy = postId;
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, content, updatedAt, updatedBy },
      { new: true }
    );

    if (!updatedPost) {
      return errorResponse(res, 404, Constants.NOT_FOUND);
    }

    return successResponse(res, Constants.UPDATED_SUCCESSFULLY, {
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const deletedPost = await Post.findByIdAndUpdate(
      postId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedPost) {
      return errorResponse(res, 404, Constants.NOT_FOUND);
    }

    return successResponse(res, Constants.DELETED_SUCCESSFULLY);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.getPostwithUserInfo = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $project: {
          title: 1,
          content: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
          isDeleted: 1,
        },
      },
    ]);
    const userIds = [
      ...new Set(
        posts
          .map((post) => post.createdBy)
          .concat(posts.map((post) => post.updatedBy))
      ),
    ];
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    const postsWithUsers = posts.map((post) => ({
      ...post,
      createdByUser: post.createdBy
        ? userMap.get(post.createdBy.toString())
        : null,
      updatedByUser: post.updatedBy
        ? userMap.get(post.updatedBy.toString())
        : null,
    }));

    return successResponse(res, Constants.RETRIEVED_SUCCESSFULLY, {
      posts: postsWithUsers,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

exports.customPostQueryy = async (req, res) => {
  const { page = 1, limit = 10, sort, search } = req.query;

  try {
    const result = await customPostQuery(page, limit, sort, search);
    return successResponse(res, Constants.RETRIEVED_SUCCESSFULLY, result);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};

// exports.getPostwithUserInfo = async (req, res) => {
//   try {
//     const posts = await Post.aggregate([
//       {
//         $lookup: {
//           from: "User",
//           localField: "user",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       {
//         $unwind: "$user",
//       },
//       {
//         $project: {
//           title: 1,
//           content: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           isDeleted: 1,
//           createdBy: 1,
//           updatedBy: 1,
//           "user._id": 1,
//           "user.username": 1,
//           "user.email": 1,
//         },
//       },
//     ]);

//     return successResponse(res, "Posts retrieved successfully", { posts });
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 500, Constants.INTERNAL_ERROR);
//   }
// };

exports.getPostwithUserInfo = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $project: {
          title: 1,
          content: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
          isDeleted: 1,
          user: 1,
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByUser",
        },
      },
      {
        $unwind: {
          path: "$createdByUser",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    return successResponse(res, Constants.RETRIEVED_SUCCESSFULLY, {
      posts,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, Constants.INTERNAL_ERROR);
  }
};
