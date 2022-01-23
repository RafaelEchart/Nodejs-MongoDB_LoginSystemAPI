const express = require("express");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const HttpError = require("../../models/http-error");
const Clientes = require("../../models/cliente");

//LOGIN CONTROLLER
const login = async (req, res, next) => {
  //MEMORY
  let validEmail;
  let validPassword;
  let token;

  //RECIEVED VARIABLES
  const { email, password } = req.body;

  //EMAIL VALIDATION
  try {
    validEmail = await Clientes.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Error connecting to the server.", 500)
    );
  }

  if (!validEmail) {
    const error = new HttpError(
      "Invalid email error.",
      403
    );
    return next(error);
  }

  try {
    //PASS VALIDATION
    validPassword = await bcrypt.compare(password, validEmail.password);
  } catch (err) {
    return next(new HttpError("Bcrypt failed."));
  }
  
  if (!validPassword) {
    const error = new HttpError(
      "Invalid password validation.",
      403
      );
      return next(error);
    }
    

  //----------------//
  //AFTER ALL DATA HAS BEEN VERIFIED

  //TOKEN

  try {
    //----------------------------------//
    //TOKEN INFORMATION
    //SUPER SECRET KEY
    //TOKEN TIME VALIDATIONN
    token = jwt.sign(
      {
        clienteId: validEmail._id,
        email: validEmail.email,
      },
      //SECRET KEY
      "DO_NOT_SHARE_INSERT_HERE_PRIVATE_KEY",
      { expiresIn: "48h" }
    );
    //------------------------------------//
    //------------------------------------//
  } catch (err) {
    return next(
      new HttpError(
        "Error at creating JWT.",
        500
      )
    );
  }

  res.status(200).json({
    userId: validEmail._id,
    email: validEmail.email,
    token: token,
  });
};

//SIGN UP CONTROLLER
const newAccount = async (req, res, next) => {
  //MEMORY
  let foundEmail;
  let hashedPass;
  let token;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Check the fields."),
      422
    );
  }

  const { name, email, secretMessage } = req.body;
  let { password } = req.body;
  password = password.toString()

  if (name.length < 5) {
    return next(
      new HttpError("Name must have at least 5 characters", 500)
    );
  }

  if (password.length < 5) {
    return next(
      new HttpError("Password must have at least 5 characters", 500)
    );
  }

  if (secretMessage.length < 5) {
    return next(
      new HttpError(
        "Secret Message must have at least 5 characters",
        500
      )
    );
  }

  try {
    foundEmail = await Clientes.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Error in database connection.", 500));
  }
  if (foundEmail) {
    return next(
      new HttpError("This email alredy exists!", 500)
    );
  }

  //------------------//
  //HASING PASS BCRYPT

  try {
    hashedPass = await bcrypt.hash(password, 12);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not hash, please try again"));
  }

  //fecha de creacion de usuario
  const fecha = new Date().toLocaleString("en-US").split(",");
  //creacion de usuario nuevo

  const newUser = new Clientes({
    name: name,
    email: email,
    date: fecha[0],
    password: hashedPass,
    secretMessage: secretMessage
  });

  //guardado de usuario nuevo
  try {
    await newUser.save();
  } catch (err) {
    console.log(err)
    return next(new HttpError("Error creating the new user.", 500));
  }

  //If creation is successful
  //We create the JWT to automatic login

  try {
    //----------------------------------//
    //TOKEN INFORMATION
    //SUPER SECRET INFORMATION
    //EXPIRATION TIME 
    token = jwt.sign(
      {
        clienteId: newUser._id,
        email: newUser.email,
      },
      //SECRET KEY
      "DO_NOT_SHARE_INSERT_HERE_PRIVATE_KEY",
      { expiresIn: "48h" }
    );
    
  } catch (err) {
    return next(new HttpError("SERVER ERRORS HAVE OCCURED", 500));
  }

  res.status(200).json({
    userID: newUser._id,
    email: newUser.email,
    // we return the token to the client for authentication purposes
    token: token,
  });
};

const getInfoCuenta = async (req, res, next) => {
  //MEMORIA
  let cliente;

  try {
    cliente = await Clientes.findById(
      req.userData.clienteId,
      "-contrasena -__v"
    ).populate(
      "pedidos",
      "-cliente -direccion.colorDomicilio -direccion.estado -direccion.mzVilla -direccion.referencias -infofactura.direccion -infofactura.estado -infofactura.telefono"
    );
  } catch (err) {
    return next(
      new HttpError(
        "Error conectando a la base de datos, intentelo de nuevo. Si el problema persiste contacte a WebFacil."
      ),
      422
    );
  }

  if (!cliente || cliente.length === 0) {
    return next(
      new HttpError(
        "Error conectando a la base de datos, intentelo de nuevo. Si el problema persiste contacte a WebFacil."
      ),
      422
    );
  }

  cliente.pedidos = cliente.pedidos.reverse();

  res.status(200).json({
    informacion: cliente,
  });
};

exports.login = login;
exports.newAccount = newAccount;
exports.getInfoCuenta = getInfoCuenta;
