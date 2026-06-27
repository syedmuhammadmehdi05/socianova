const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);


app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "API working successfully"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});