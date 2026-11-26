// Model Categoria: agrupa os produtos (ex.: Bebidas, Limpeza)
const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Schema = "molde" do documento: define os campos, tipos e regras
const Categoria = new Schema({
    nome: {
        type: String,
        required: true      // obrigatório: o Mongoose não salva sem ele
    },
    slug: {
        type: String,       // nome "amigável" para URL (ex.: "material-de-limpeza")
        required: true
    },
    date: {
        type: Date,
        default: Date.now   // se não for informado, recebe a data/hora atual
    }
})

// Registra o model com o nome da coleção "categorias" no MongoDB.
// Nas rotas ele é recuperado com mongoose.model("categorias")
mongoose.model("categorias", Categoria)
