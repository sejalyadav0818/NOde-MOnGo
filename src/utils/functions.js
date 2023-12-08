const Post = require("../models/Post");
const User = require("../models/User");

const successResponse = (res, message, data = null) => {
  return res.status(200).json({ success: true, message, data });
};

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

const applySorting = (query, sort) => {
  if (sort) {
    const [field, order] = sort.split(":");
    query.sort({ [field]: order === "desc" ? -1 : 1 });
  }
};

const applySearching = (query, search) => {
  try {
    if (search !== undefined && search !== null) {
      const trimmedSearch = search.trim();
      console.log("Trimmed Search:", trimmedSearch);
      if (trimmedSearch !== "") {
        const searchRegex = new RegExp(trimmedSearch, "i"); // Case-insensitive search
        query.or([{ username: searchRegex }, { email: searchRegex }]);
      }
    }
  } catch (error) {
    console.error("Error in applySearching:", error);
  }
};

const applyPagination = (query, page, limit) => {
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);
};

const customUserQuery = async (page, limit, sort, search) => {
  try {
    const query = User.find();
    applySorting(query, sort);
    applySearching(query, search);
    applyPagination(query, page, limit);

    const total = await User.countDocuments(query.getQuery());
    const users = await query.exec();

    return { users, total };
  } catch (error) {
    throw error;
  }
};

const customPostQuery = async (page, limit, sort, search) => {
  try {
    const query = Post.find();
    applySorting(query, sort);
    applySearching(query, search);
    applyPagination(query, page, limit);

    const total = await Post.countDocuments(query.getQuery());
    const posts = await query.exec();

    return { posts, total };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  customUserQuery,
  applyPagination,
  applySearching,
  applySorting,
  successResponse,
  errorResponse,
  customPostQuery,
};

//check http://localhost:3000/customUserQuery?page=1&limit=10&sort=username:desc&search=john
