const express = require("express");
const path = require("path");
const { db } = require("./config/db");

const app = express();
const cors = require("cors");
const { json, urlencoded } = require("body-parser");

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());


const port = process.env.PORT || 5000;

const buildPath = path.join(__dirname, "./client/build");
app.use(express.static(buildPath));

app.get("/ping", async (req, res) => {

  return res.status(200).send("pong");
});

app.post("/calculateTDEE", async (req, res) => {
  const { weight, fat, activityLevel } = req.body;

  const BMR = (21.6 * (weight - ((fat / 100) * weight)) + 370).toFixed(2)
  const TDEE = (activityLevel * BMR).toFixed(2)

  return res.status(200).send({ success: true, data: { TDEE, BMR } });
});

app.post("/submit", async (req, res) => {
  const { userName, checkedCalorieData, calculatedTDEEData ,items } = req.body;
  const user = await db.user.create({
    data: {
      name: userName,
      healthInfo:req.body
    }
  })
  return res.status(200).send({ success: true , user: user });
});


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(port, () => {
  console.log(`Server is listning at http://localhost:${port}`);
});
