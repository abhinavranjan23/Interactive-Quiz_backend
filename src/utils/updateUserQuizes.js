const User = require("../models/userSchema");

const updateUserQuizAttempt = async (userId, quizId, score) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    user.quizAttempts.push({ quizId, score });
    user.quizAttempted += 1;
    user.totalScore += score;

    await user.save();

    return {
      success: true,
      message: "Quiz attempt recorded successfully",
      user,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error updating quiz attempt",
      error: error.message,
    };
  }
};
module.exports = updateUserQuizAttempt;
