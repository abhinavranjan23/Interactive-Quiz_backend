const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalScore: { type: Number, default: 0 },
  quizAttempted: { type: Number, default: 0 },
  rank: { type: Number, default: null },
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
module.exports = Leaderboard;
