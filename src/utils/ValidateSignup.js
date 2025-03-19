const validator = require("validator");

function validateSignup({ name, email, password }) {
  const errors = {};

  // Validate name
  if (!name || validator.isEmpty(name.trim())) {
    errors.name = "Name is required.";
  }
  if (name.length < 3) {
    errors.name = "Name must be at least 3 characters long";
  }
  if (name.length > 20) {
    errors.name = "Name must be at most 20 characters long";
  }

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.email = "Invalid email address.";
  }

  // Validate password
  if (!password || !validator.isStrongPassword(password)) {
    errors.password =
      "Password must be at least 6 length with UpperCase, Lower Case,Special Char, Number .";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = validateSignup;
