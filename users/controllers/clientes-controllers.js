const express = require("express");
const router = express.Router();
//Librerias
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

const fs = require("fs");
const HttpError = require("../../models/http-error");
const Clientes = require("../../models/cliente");

// const disk = require('../middleware/check-disk')

//INICIAR SESION
const iniciarSesion = async (req, res, next) => {
  //MEMORIA
  let correoExistente;
  let passEsValida;
  let token;

  //Variables req.body
  const { correo, contrasena } = req.body;

  //Validacion de CORREO
  try {
    correoExistente = await Clientes.findOne({ correo: correo });
  } catch (err) {
    return next(
      new HttpError("Error al iniciar sesion, intente de nuevo", 500)
    );
  }

  if (!correoExistente) {
    const error = new HttpError(
      "Credenciales erroneas, intente de nuevo.",
      403
    );
    return next(error);
  }

  try {
    //return a boolean
    passEsValida = await bcrypt.compare(contrasena, correoExistente.contrasena);
  } catch (err) {
    return next(new HttpError("Credenciales erroneas, intente de nuevo."));
  }

  if (!passEsValida) {
    const error = new HttpError(
      "Credenciales erroneas, intente de nuevo.",
      403
    );
    return next(error);
  }

  //----------------//
  //Verificacion de data pasada

  //TOKEN

  try {
    //----------------------------------//
    //informacion que queremos que contenga
    //clave super secreta
    //tiempo de expiracion(consultar los tipos de reglas que se pueden aplicar)
    token = jwt.sign(
      {
        clienteId: correoExistente._id,
        email: correoExistente.correo,
      },
      //CLAVE SECRETA
      "DO_NOT_SHARE_INSERT_HERE_PRIVATE_KEY",
      { expiresIn: "48h" }
    );
    //------------------------------------//
    //------------------------------------//
  } catch (err) {
    return next(
      new HttpError(
        "Error al intentar iniciar la sesion. Intente de nuevo",
        500
      )
    );
  }

  res.status(200).json({
    clienteId: correoExistente._id,
    correo: correoExistente.correo,
    token: token,
  });
};

//CREAR CUENTA
const crearCuenta = async (req, res, next) => {
  //MEMORIA
  let usuarioExistente;
  let hashedPass;
  let token;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Informacion incorrecta, revisa los campos."),
      422
    );
  }

  const { nombre, correo, secretMessage } = req.body;
  let { contrasena } = req.body;

  if (nombre.length < 5) {
    return next(
      new HttpError("El nombre debe contener al menos 5 letras.", 500)
    );
  }

  if (contrasena.length < 5) {
    return next(
      new HttpError("La contraseña debe contener al menos 5 caracteres.", 500)
    );
  }

  if (secretMessage.length < 5) {
    return next(
      new HttpError(
        "El secretMessage debe contener al menos 5 caracteres.",
        500
      )
    );
  }

  try {
    usuarioExistente = await Clientes.findOne({ correo: correo });
  } catch (err) {
    return next(new HttpError("No se pudo conectar a la base de datos.", 500));
  }
  if (usuarioExistente) {
    return next(
      new HttpError("Correo ya fue registrado, intente con uno diferente", 500)
    );
  }

  //------------------//
  //HASING PASS BCRYPT

  contrasena = contrasena.toString();

  try {
    hashedPass = await bcrypt.hash(contrasena, 12);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not hash, please try again"));
  }

  //fecha de creacion de usuario
  const fecha = new Date().toLocaleString("en-US").split(",");
  console.log(nombre, correo, hashedPass, secretMessage, fecha);
  //creacion de usuario nuevo

  const nuevoUsuario = new Clientes({
    nombre: nombre,
    correo: correo,
    fechaRegistro: fecha[0],
    contrasena: hashedPass,
    secretMessage: secretMessage
  });

  //guardado de usuario nuevo
  // try {
  //   await nuevoUsuario.save();
  // } catch (err) {
  //   return next(new HttpError("Error tratando de crear nuevo usuario.", 500));
  // }

  //Si la creacion es exitosa
  //Creamos un token para un login automatico.

  try {
    //----------------------------------//
    //informacion que queremos que contenga
    //clave super secreta
    //tiempo de expiracion(consultar los tipos de reglas que se pueden aplicar)
    token = jwt.sign(
      {
        clienteId: nuevoUsuario._id,
        email: nuevoUsuario.correo,
      },
      //CLAVE SECRETA
      "DO_NOT_SHARE_INSERT_HERE_PRIVATE_KEY",
      { expiresIn: "48h" }
    );
    //------------------------------------//
    //------------------------------------//
  } catch (err) {
    return next(new HttpError("Ocurrieron problemas en el servidor.", 500));
  }

  res.status(200).json({
    clienteId: nuevoUsuario._id,
    correo: nuevoUsuario.correo,
    // enviamos siempre el token creado
    token: token,
    // token: "Usuario creado!",
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

exports.iniciarSesion = iniciarSesion;
exports.crearCuenta = crearCuenta;
exports.getInfoCuenta = getInfoCuenta;
