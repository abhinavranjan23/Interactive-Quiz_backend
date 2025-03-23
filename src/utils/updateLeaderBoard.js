const Leaderboard = require("../models/leaderBoardSchema");

const updateLeaderboardRanks = async () => {
  const leaderboardEntries = await Leaderboard.find().sort({ totalScore: -1 });

  for (let i = 0; i < leaderboardEntries.length; i++) {
    leaderboardEntries[i].rank = i + 1;
    await leaderboardEntries[i].save();
  }
};
module.exports = updateLeaderboardRanks;
