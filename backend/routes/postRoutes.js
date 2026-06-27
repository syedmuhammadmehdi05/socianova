const express = require("express");
const router = express.Router();

const { createPost, getPosts, getUserPosts, likePost, addComment, deletePost, editPost } = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getPosts);
router.get("/user/:id", protect, getUserPosts);

router.post("/", protect, createPost);
router.put("/:id/like", protect, likePost);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deletePost);
router.put("/:id", protect, editPost);

module.exports = router;