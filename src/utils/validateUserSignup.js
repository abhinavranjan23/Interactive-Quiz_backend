function validateUserSignup(userData) {
  const errors = {};

  if (typeof userData === "string") {
    if (
      !userData ||
      !validator.isStrongPassword(userData, {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      errors.password =
        "Password must be at least 6 characters long with at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  const {
    firstName,
    lastName,
    email,
    password,
    age,
    city,
    state,
    country,
    imageUrl,
  } = userData;

  if (!firstName || validator.isEmpty(firstName.trim())) {
    errors.firstName = "First name is required.";
  }
  if (firstName && firstName.length < 2) {
    errors.firstName = "First name must be at least 2 characters long.";
  }

  if (!lastName || validator.isEmpty(lastName.trim())) {
    errors.lastName = "Last name is required.";
  }
  if (lastName && lastName.length < 2) {
    errors.lastName = "Last name must be at least 2 characters long.";
  }

  if (!email || !validator.isEmail(email)) {
    errors.email = "Invalid email address.";
  }

  if (
    !password ||
    !validator.isStrongPassword(password, {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    errors.password =
      "Password must be at least 6 characters long with at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  if (!age || isNaN(age) || age < 7) {
    errors.age = "Age must be at least 7.";
  }

  if (!city || validator.isEmpty(city.trim())) {
    errors.city = "City is required.";
  }
  if (city.length < 2) {
    errors.city = "City must be at least 2 characters long.";
  }

  if (!state || validator.isEmpty(state.trim())) {
    errors.state = "State is required.";
  }
  if (state.length < 2) {
    errors.state = "State must be at least 2 characters long.";
  }

  if (country && country.trim().length < 2) {
    errors.country = "Country must be at least 2 characters long.";
  }

  if (
    imageUrl &&
    !validator.isURL(imageUrl, {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ) {
    errors.imageUrl = "Invalid image URL format.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = validateUserSignup;
