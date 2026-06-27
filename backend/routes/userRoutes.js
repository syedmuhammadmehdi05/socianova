const express = require("express");
const router = express.Router();

const { createUser, loginUser, followUser, searchUsers, getUserProfile, updateProfile, updateAvatar, deleteAccount } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "User route working"
    });
});

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/search", protect, searchUsers);
router.put("/:id/follow", protect, followUser);

router.get("/profile", protect, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

router.put("/profile", protect, updateProfile);
router.put("/avatar", protect, updateAvatar);

router.get("/:id", protect, getUserProfile);

router.delete("/profile", protect, deleteAccount);

module.exports = router;