function validateQuiz(quiz) {
  const errors = [];

  if (
    !quiz.title ||
    typeof quiz.title !== "string" ||
    quiz.title.trim() === ""
  ) {
    errors.push("Quiz title is required and must be a non-empty string.");
  }

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    errors.push("Quiz must have at least one question.");
  } else {
    quiz.questions.forEach((question, index) => {
      if (
        !question.questionText ||
        typeof question.questionText !== "string" ||
        question.questionText.trim() === ""
      ) {
        errors.push(`Question ${index + 1} must have a valid questionText.`);
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        errors.push(`Question ${index + 1} must have at least two options.`);
      }

      if (
        !question.correctAnswer ||
        typeof question.correctAnswer !== "string"
      ) {
        errors.push(`Question ${index + 1} must have a valid correctAnswer.`);
      }

      if (typeof question.score !== "number" || question.score <= 0) {
        errors.push(`Question ${index + 1} must have a valid score.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = validateQuiz;
