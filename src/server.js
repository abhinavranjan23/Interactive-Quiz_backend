const express = require("express");
const app = express();
const connectDB = require("./config/database.js");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const quizzesRouter = require("./routes/quizzes.js");
const cors = require("cors");
const adminRouter = require("./routes/admin.js");
const userRoute = require("./routes/userRoutes.js");
const leaderboardRoute = require("./routes/leaderBoard.js");
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://brainrush.abhinavranjan.me"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/", adminRouter);
app.use("/", quizzesRouter);
app.use("/", userRoute);
app.use("/", leaderboardRoute);
app.get("/", (req, res) => {
  res.send("Welcome to Interactive Quiz API");
});

app.use("/", (req, res, err) => {
  //
  if (err) {
    res.status(500).json({ error: "something went wrong " });
  }
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server Connected Successfuly");
    });
  })
  .catch((err) => {
    console.log("Error in connecting database", err);
    process.exit(1);
  });
