const Post = require("../models/Post");

const createPost = async (req, res) => {
    try {
        const { content } = req.body;

        const post = await Post.create({
            user: req.user._id,
            content
        });

        const populatedPost = await Post.findById(post._id)
            .populate("user", "username email");

        res.status(201).json(populatedPost);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "username email")
            .populate("comments.user", "username")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.id })
            .populate("user", "username email")
            .populate("comments.user", "username")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            posts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const userId = req.user._id.toString();

        const alreadyLiked = post.likes
            .map(id => id.toString())
            .includes(userId);

        if (alreadyLiked) {
            // UNLIKE (remove user from likes)
            post.likes = post.likes.filter(
                id => id.toString() !== userId
            );
        } else {
            // LIKE (add user)
            post.likes.push(req.user._id);
        }

        await post.save();

        res.json({
            success: true,
            isLiked: !alreadyLiked,
            likes: post.likes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const comment = {
            user: req.user._id,
            text: req.body.text
        };

        post.comments.push(comment);

        await post.save();

        res.json({
            success: true,
            message: "Comment added",
            comments: post.comments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own posts"
            });
        }

        await post.deleteOne();

        res.json({
            success: true,
            message: "Post deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const editPost = async (req, res) => {
    try {
        const { content } = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own posts"
            });
        }

        post.content = content;

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate("user", "username email")
            .populate("comments.user", "username");

        res.json({
            success: true,
            message: "Post updated successfully",
            post: updatedPost
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    getUserPosts,
    likePost,
    addComment,
    deletePost,
    editPost
};