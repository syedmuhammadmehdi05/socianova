const User = require("../models/User");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUsername = await User.findOne({ username });

        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        }

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const newUser = await User.create({
            username,
            email,
            password
        });

        res.status(201).json({
            success: true,
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                bio: newUser.bio
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            });
        }

        const isFollowing = currentUser.following.includes(req.params.id);

        if (isFollowing) {
            // UNFOLLOW
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== req.params.id
            );

            userToFollow.followers = userToFollow.followers.filter(
                id => id.toString() !== req.user._id.toString()
            );
        } else {
            // FOLLOW
            currentUser.following.push(req.params.id);
            userToFollow.followers.push(req.user._id);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({
            success: true,
            following: !isFollowing,
            message: !isFollowing ? "User followed" : "User unfollowed"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const searchUsers = async (req, res) => {
    try {
        const searchTerm = req.query.q;

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const users = await User.find({
            username: {
                $regex: searchTerm,
                $options: "i"
            }
        }).select("_id username email bio");

        res.json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("followers", "username")
            .populate("following", "username");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, name, bio } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (
            username &&
            username !== user.username
        ) {
            const existingUser = await User.findOne({ username });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Username already exists"
                });
            }

            user.username = username;
        }

        if (name !== undefined) {
            user.name = name;
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                bio: user.bio
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;

        const allowedAvatars = [
            "man",
            "woman",
            "robot",
            "astronaut",
            "cat",
            "fox",
            "sheep",
            "goat"
        ];

        if (!allowedAvatars.includes(avatar)) {
            return res.status(400).json({
                success: false,
                message: "Invalid avatar selected"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.avatar = avatar;

        await user.save();

        res.json({
            success: true,
            message: "Avatar updated successfully",
            avatar: user.avatar
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.user._id);

        res.json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    followUser,
    searchUsers,
    getUserProfile,
    updateProfile,
    updateAvatar,
    deleteAccount
};