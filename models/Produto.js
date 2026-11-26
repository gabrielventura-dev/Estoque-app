// Model Produto: item do estoque
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Produto = new Schema({
    nome: {
        type: String,
        required: true
    },
    codigo: {
        type: String,
        required: true,
        unique: true        // SKU: o MongoDB cria um índice que não deixa repetir
    },
    descricao: {
        type: String
    },
    preco: {
        type: Number,
        required: true,
        min: 0              // não aceita preço negativo
    },
    quantidade: {
        type: Number,
        default: 0,         // quantidade atual em estoque
        min: 0              // o estoque nunca fica negativo
    },
    estoqueMinimo: {
        type: Number,
        default: 5          // abaixo ou igual a isso, o produto entra no alerta de estoque baixo
    },
    // Relacionamentos: guardamos só o _id do outro documento.
    // "ref" diz em qual coleção o populate() deve buscar o documento completo
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",  // Categoria 1..N Produto
        required: true
    },
    fornecedor: {
        type: Schema.Types.ObjectId,
        ref: "fornecedores", // Fornecedor 1..N Produto
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

// Coleção "produtos"
mongoose.model("produtos", Produto)
