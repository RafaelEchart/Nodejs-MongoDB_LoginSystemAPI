const HttpError = require("../../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    //extraemos el token de la request del cliente
    // viene dentro del HEADER - AUTHORIZATION
    // {autorization: bearer TOKEN} ← hay que separar solo el token
    // con el metodo split(' ') creamos un array por cada espacio
    //con el [1] seleccionamos el segundo objeto que seria el TOKEN
    const token = req.headers.authorization.split(" ")[1];

    // split token succeded pero no nos da ningun token
    if (!token) {
      throw new Error("Authentication failed!");
    }

    //si sobrevivimos ambos procesos y si tenemos TOKEN
    //el TOKEN puede ser invalido
    //validacion ↓
    const decodedTOKEN = jwt.verify(token, "DO_NOT_SHARE_INSERT_HERE_PRIVATE_KEY"); // usar la misma clave secreta que cuando se genero

    // enviamos userID dentro de la peticion del cliente
    req.userData = { clienteId: decodedTOKEN.clienteId };
    //SIGUIENTE MIDDLEWARE

    next();
  } catch (err) {
    //en caso de que el token nisiquiera venga en la peticion y el split falle
    return next(new HttpError("Authentication Failed", 403));
  }
};
