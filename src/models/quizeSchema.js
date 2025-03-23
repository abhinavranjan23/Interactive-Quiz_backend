const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    titleImage: String,
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["multiple-choice", "true-false", "short-answer"],
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: function () {
            return this.type !== "short-answer";
          },
          validate: {
            validator: function (arr) {
              return this.type === "short-answer" || arr.length > 0;
            },
            message:
              "Options must have at least one option (except short-answer).",
          },
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
      },
    ],
    totalScore: {
      type: Number,
      required: true,
      default: 0,
    },
    maxDuration: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

quizSchema.pre("save", function (next) {
  this.totalScore = this.questions.reduce((sum, q) => sum + q.score, 0);
  next();
});

quizSchema.index({ title: 1, topic: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
