// Model Movimentacao: registro de ENTRADA ou SAÍDA de um produto do estoque
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Movimentacao = new Schema({
    produto: {
        type: Schema.Types.ObjectId,
        ref: "produtos",    // Produto 1..N Movimentacao
        required: true
    },
    tipo: {
        type: String,
        enum: ["entrada", "saida"], // só aceita um desses dois valores
        required: true
    },
    quantidade: {
        type: Number,
        required: true,
        min: 1              // precisa movimentar pelo menos 1 unidade
    },
    observacao: {
        type: String        // ex.: "Compra NF 123", "Venda balcão"
    },
    date: {
        type: Date,
        default: Date.now   // data/hora da movimentação
    }
})

// Coleção "movimentacoes"
mongoose.model("movimentacoes", Movimentacao)
