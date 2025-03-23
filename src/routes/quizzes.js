const express = require("express");
const quizzesRouter = express.Router();
const Quiz = require("../models/quizeSchema.js");

quizzesRouter.get("/quizzes/trending", async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const limitValue = parseInt(limit, 10);
    const pageValue = parseInt(page, 10);

    if (
      isNaN(limitValue) ||
      isNaN(pageValue) ||
      limitValue <= 0 ||
      pageValue <= 0
    ) {
      return res.status(400).json({ error: "Invalid limit or page value" });
    }

    const trendingQuizzes = await Quiz.find({ isTrending: true })
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue);

    res.status(200).json({ quizzes: trendingQuizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
quizzesRouter.get("/quizzes", async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const limitValue = parseInt(limit, 10);
    const pageValue = parseInt(page, 10);

    if (
      isNaN(limitValue) ||
      isNaN(pageValue) ||
      limitValue <= 0 ||
      pageValue <= 0
    ) {
      return res.status(400).json({ error: "Invalid limit or page value" });
    }

    const quizzes = await Quiz.find()
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue);

    res.status(200).json({ quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = quizzesRouter;
