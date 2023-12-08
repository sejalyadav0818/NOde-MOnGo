const express = require("express");
const router = express.Router();
const postController = require("../controller/postController");
const postValidator = require("../validators/postValidator");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/create-post", upload.single("image"), postController.createPost);

router.get("/get-post/:userId", postController.getPostById);

router.get("/get-post", postController.getPosts);

router.put(
  "/update-post/:postId",
  postValidator.handleValidationErrors,
  postController.updatePost
);

router.delete(
  "/delete-post/:postId",
  postValidator.handleValidationErrors,
  postController.deletePost
);

router.get("/getPostwithUserInfo", postController.getPostwithUserInfo);

router.get("/customPostQuery", postController.customPostQueryy);

module.exports = router;
