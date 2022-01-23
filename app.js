const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./models/http-error");

//USERS
const usersRoutes = require("./users/routes/users-routes");

const app = express();

app.use(bodyParser.json());

//CORS option for the backend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});


app.use("/api/users", usersRoutes)

//Error for unfound routes
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});



mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);
