// Model Usuario: quem pode entrar no sistema
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,       // o MongoDB não deixa dois usuários com o mesmo e-mail
        lowercase: true,    // salva sempre em minúsculas (Joao@x.com = joao@x.com)
        trim: true
    },
    senha: {
        type: String,       // NUNCA a senha em texto: guarda "salt:hash" (ver routes/usuarios.js)
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

mongoose.model("usuarios", Usuario)
