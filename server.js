var express = require("express");
var mysql = require("./comman/dbConnection");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
require('dotenv').config()
app.use(express.static(__dirname + '/public'));
app.use(cors({ origin: ["http://localhost:3232"], credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }))
//app.use(bodyParser.json());
require("./routes/studentProfile")(app);
app.get("/", (req, res) => {
  res.json("welcome to student-dashboard");
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Connected to port " + port);
});
