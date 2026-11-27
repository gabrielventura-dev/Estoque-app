// Rotas da página inicial (Dashboard) - prefixo "/"
const express = require("express")
const router = express.Router()     // grupo de rotas, registrado no app.js
const mongoose = require("mongoose")
// Pega os models já registrados na pasta models
let Produto = mongoose.model("produtos")
let Categoria = mongoose.model("categorias")
let Fornecedor = mongoose.model("fornecedores")
let Movimentacao = mongoose.model("movimentacoes")

// Dashboard: totais, produtos com estoque baixo e últimas movimentações
router.get("/", function (req, res) {
    // Promise.all executa as 4 consultas e espera TODAS terminarem.
    // O resultado vem num array, na mesma ordem das consultas
    Promise.all([
        Produto.find().sort({ date: 'desc' }).lean(),           // [0] todos os produtos
        Categoria.countDocuments(),                             // [1] quantidade de categorias
        Fornecedor.countDocuments(),                            // [2] quantidade de fornecedores
        Movimentacao.find().populate("produto").sort({ date: 'desc' }).limit(5).lean() // [3] 5 últimas movimentações
    ]).then(function (resultados) {
        let produtos = resultados[0]
        let valorTotal = 0
        let estoqueBaixo = []
        // Percorre os produtos somando o valor do estoque e separando os de estoque baixo
        produtos.forEach(function (produto) {
            valorTotal = valorTotal + produto.preco * produto.quantidade
            if (produto.quantidade <= produto.estoqueMinimo) {
                estoqueBaixo.push(produto)
            }
        })
        // Envia os dados para a view views/home.handlebars
        res.render("home", {
            totalProdutos: produtos.length,
            totalCategorias: resultados[1],
            totalFornecedores: resultados[2],
            valorTotal: valorTotal,
            estoqueBaixo: estoqueBaixo,
            ultimasMovimentacoes: resultados[3]
        })
    }).catch(function (erro) {
        // aqui não há redirect, então a mensagem vai direto para a view
        res.render("home", { error_msg: "Houve um erro ao carregar o dashboard" })
    })
})

// Exporta o router para ser usado no app.js
module.exports = router
