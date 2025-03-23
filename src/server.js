const express = require("express");
const app = express();
const connectDB = require("./config/database.js");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const quizzesRouter = require("./routes/quizzes.js");
const cors = require("cors");
const adminRouter = require("./routes/admin.js");
const userRoute = require("./routes/userAuthRoutes.js");
const leaderboardRoute = require("./routes/leaderBoard.js");
app.use(express.json()); // JSON body parsing
app.use(cookieParser()); // Cookie parsing
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://l8hgmtrh-5173.inc1.devtunnels.ms",
    ],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use("/", adminRouter);
app.use("/", quizzesRouter);
app.use("/", userRoute);
app.use("/", leaderboardRoute);

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
