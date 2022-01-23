const express = require("express");
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

//object destructuring for CHECK in express-validator
// const checkAuth = require("../middleware/check-auth");

const clientesControllers = require("../controllers/clientes-controllers");

const router = express.Router();

//INICIAR SESION
router.post("/iniciar-sesion",
    [check("correo").not().isEmpty(),
    check("contrasena").not().isEmpty()],
    clientesControllers.iniciarSesion);

//CREAR USUARIO
router.post("/new-account",
    [check("nombre").not().isEmpty(),
    check("secretMessage").not().isEmpty(),
    check("correo").normalizeEmail().isEmail(),
    check("contrasena").not().isEmpty()],
     clientesControllers.crearCuenta);

//ENVIAR MENSAJE A SERVER
// router.post("/mensaje-nuevo",
//     [check("nombre").not().isEmpty(),
//     check("email").not().isEmpty(),
//     check("celular").not().isEmpty(),
//     check("asunto").not().isEmpty(),
//     check("mensaje").not().isEmpty()],
//      clientesControllers.crearMensajeNoCliente);




router.use(checkAuth);

//RUTAS CON AUTORIZACION
router.get("/info-cuenta", clientesControllers.getInfoCuenta);

// router.post("/nueva-info-domicilio",
// [check("direccion").not().isEmpty(),
// check("referencias").not().isEmpty(),
// check("colorDomicilio").not().isEmpty(),
// check("mzVilla").not().isEmpty()],
// clientesControllers.crearDomicilio);


// router.post("/nueva-info-facturacion",
// [check("cedulaRUC").not().isEmpty(),
// check("nombre").not().isEmpty(),
// check("direccion").not().isEmpty(),
// check("telefono").not().isEmpty()],
// clientesControllers.crearFacturacion);


// //ENVIAR MENSAJE DE CLIENTE A SERVER
// router.post("/mensaje-nuevo-de-cliente",
//     [check("nombre").not().isEmpty(),
//     check("celular").not().isEmpty(),
//     check("asunto").not().isEmpty(),
//     check("mensaje").not().isEmpty()],
//      clientesControllers.crearMensajeCliente);




//EXPORT ROUTER
module.exports = router;

