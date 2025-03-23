const express = require("express");
const leaderboardRoute = express.Router();

const Leaderboard = require("../models/leaderBoardSchema");

leaderboardRoute.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ rank: 1 })
      .populate(
        "user",
        "firstName lastName age imageUrl city state country socialLogin lastLogin"
      )
      .limit(10);

    res.json({ data: leaderboard });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
module.exports = leaderboardRoute;
