const express = require("express");
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

//object destructuring for CHECK in express-validator
// const checkAuth = require("../middleware/check-auth");

const clientesControllers = require("../controllers/clientes-controllers");

const router = express.Router();

//INICIAR SESION
router.post("/log-in",
    [check("correo").not().isEmpty(),
    check("contrasena").not().isEmpty()],
    clientesControllers.login);

//CREAR USUARIO
router.post("/new-account",
    [check("nombre").not().isEmpty(),
    check("secretMessage").not().isEmpty(),
    check("correo").normalizeEmail().isEmail(),
    check("contrasena").not().isEmpty()],
     clientesControllers.newAccount);


router.use(checkAuth);

//RUTAS CON AUTORIZACION
router.get("/info-cuenta", clientesControllers.getInfoCuenta);

//EXPORT ROUTER
module.exports = router;

