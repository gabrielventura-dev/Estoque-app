// Model Fornecedor: empresa que fornece os produtos
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Fornecedor = new Schema({
    nome: {
        type: String,
        required: true      // único campo obrigatório do fornecedor
    },
    cnpj: {
        type: String        // texto, pois tem pontos, barra e traço
    },
    telefone: {
        type: String
    },
    email: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now   // data de cadastro
    }
})

// Coleção "fornecedores"
mongoose.model("fornecedores", Fornecedor)
