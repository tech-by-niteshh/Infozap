const express = require("express");
const {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByCategory,
  likePost,
} = require("../controllers/postController");

const router = express.Router();

router.route("/").post(createPost).get(getAllPosts);
router.get("/category/:category", getPostsByCategory);
router.patch("/:id/like", likePost);
router.get("/:id", getPostById);

module.exports = router;
