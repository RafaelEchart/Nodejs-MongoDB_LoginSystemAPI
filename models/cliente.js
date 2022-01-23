const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const clienteSchema = new Schema({
  name: { type: String, required: true },
  //Email is an information que requerimos muy rapido asi que agregamos
  // un INDEX con unique.
  email: { type: String, required: true, unique: true },
  password: { type: String, require: true },
  secretMessage: { type: String, require: true },
  // celular: { type: String, require: true },
  date: { type: String, require: true },
  
  //definimos el tipo para poder popularlo con el places database y usamos array para
  //identificar que tendremos varios objectID en nuestro user
  // pedidos: [{ type: mongoose.Types.ObjectId, require: true,  ref: "Pedidos" }],
  // direccion: [{ type: String, require: true,  ref: "Pedidos" }],
  // locationCoordinates: locationTYPE,
  // location: {
  //   lat: { type: Number, required: true },
  //   lng: { type: Number, required: true },
  // },
});

clienteSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Clientes", clienteSchema, "Clientes");
