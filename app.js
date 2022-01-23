const mongoose = require("mongoose");
//filesystem para manejar archivos en server (ELIMINAR POR ERROR MULTER)
const fs = require("fs");
//path for images route
const path = require("path");
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

//errores de rutas no especificadas
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

//CREDENTIALS
//coneccion con mongo db
mongoose
  .connect(
    `mongodb+srv://test:test@testserver.bs7pw.mongodb.net/nombredelnegocio?retryWrites=true&w=majority`,
    { useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then(() => {
    app.listen(5000, console.log("Server listening on port 5000"));
  })
  .catch((err) => {
    console.log(err);
  });

mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);
