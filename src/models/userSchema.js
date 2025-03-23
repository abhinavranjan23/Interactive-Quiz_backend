const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    imageUrl: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/,
        "Please provide a valid image URL",
      ],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [7, "Age cannot be less than 7"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City must be at least 2 characters long"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      minlength: [2, "State must be at least 2 characters long"],
    },
    country: {
      type: String,
      trim: true,
      minlength: [2, "Country must be at least 2 characters long"],
    },

    totalScore: {
      type: Number,
      default: 0,
      min: [0, "Total score cannot be negative"],
    },
    quizAttempted: {
      type: Number,
      default: 0,
      min: [0, "Quiz attempted cannot be negative"],
    },
    quizAttempts: [
      {
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
        score: { type: Number, required: true },
        attemptedAt: { type: Date, default: Date.now },
      },
    ],
    socialLogin: {
      googleId: { type: String, default: null },
      facebookId: { type: String, default: null },
    },

    lastLogin: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ lastLogin: -1 });
userSchema.index({ totalScore: -1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;
