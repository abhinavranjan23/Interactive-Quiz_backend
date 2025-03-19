const express = require("express");
const app = express();
const connectDB = require("./config/database.js");
require("dotenv").config();

app.get("/hello", (req, res) => {
  res.send("Hello World");
});
app.use("/", (req, res, err) => {
  //
  if (err) {
    res.status(500).send("something went wrong");
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
