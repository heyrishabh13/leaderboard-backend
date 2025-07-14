const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(
  "mongodb+srv://heyrishabh13:fdyzvM0QOh5LmRms@cluster0.rjwuyra.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, default: 0 },
});
const User = mongoose.model("User", userSchema);

// Points History Schema
const pointsHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  points: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});
const PointsHistory = mongoose.model("PointsHistory", pointsHistorySchema);

// Initialize 10 users if collection is empty
const initializeUsers = async () => {
  const users = [
    "Rahul",
    "Kamal",
    "Sanak",
    "Amit",
    "Priya",
    "Vikram",
    "Neha",
    "Ravi",
    "Sneha",
    "Arjun",
  ];
  const count = await User.countDocuments();
  if (count === 0) {
    for (const name of users) {
      await User.create({ name });
    }
    console.log("Initialized 10 users");
  }
};
initializeUsers();

// Routes
// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Add new user
app.post("/users", async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.create({ name });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error adding user" });
  }
});

// Claim points
app.post("/claim-points", async (req, res) => {
  try {
    const { userId } = req.body;
    const points = Math.floor(Math.random() * 10) + 1; // Random points 1-10
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.points += points;
    await user.save();

    // Save points history
    const history = await PointsHistory.create({ user: userId, points });
    await history.populate("user");
    res.json({ user, points });
  } catch (error) {
    res.status(500).json({ error: "Error claiming points" });
  }
});

// Get points history
app.get("/points-history", async (req, res) => {
  try {
    const history = await PointsHistory.find().populate("user");
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Error fetching points history" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
