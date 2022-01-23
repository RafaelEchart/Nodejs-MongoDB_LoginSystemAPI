const express = require("express");
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

//object destructuring for CHECK in express-validator
// const checkAuth = require("../middleware/check-auth");

const clientesControllers = require("../controllers/clientes-controllers");

const router = express.Router();

//LOG IN ROUTE TO CONTROLLER
router.post("/log-in",
    [check("correo").not().isEmpty(),
    check("contrasena").not().isEmpty()],
    clientesControllers.login);

//NEW ACCOUNT ROUTE TO CONTROLLER
router.post("/new-account",
    [check("name").not().isEmpty(),
    check("secretMessage").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").not().isEmpty()],
     clientesControllers.newAccount);


router.use(checkAuth);

//ROUTES WITH AUTHENTICATION
router.get("/info-cuenta", clientesControllers.getInfoCuenta);

//EXPORT ROUTER
module.exports = router;

