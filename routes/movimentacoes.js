// Rotas de Movimentações (entrada/saída de estoque) - prefixo "/movimentacoes"
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
let Movimentacao = mongoose.model("movimentacoes")
let Produto = mongoose.model("produtos")

// Carrega a lista de produtos (para o <select>) e renderiza o formulário.
// Usada ao abrir o formulário e quando ele volta com erros
function renderFormulario(res, dados) {
    Produto.find().sort({ nome: 'asc' }).lean().then(function (produtos) {
        dados.produtos = produtos
        res.render("movimentacoes/nova", dados)
    }).catch(function (erro) {
        res.render("movimentacoes/nova", dados)
    })
}

// GET /movimentacoes - histórico, mais recentes primeiro
router.get("/", function (req, res) {
    // populate("produto") traz o documento do produto para mostrar o nome
    Movimentacao.find().populate("produto").sort({ date: 'desc' }).lean().then(function (movimentacoes) {
        res.render("movimentacoes/lista", { movimentacoes: movimentacoes })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao listar as movimentações")
        res.redirect("/")
    })
})

// GET /movimentacoes/nova - formulário
// (aceita ?produto=ID para já vir com o produto selecionado, usado na tela de detalhe)
router.get("/nova", function (req, res) {
    renderFormulario(res, { movimentacao: { produto: req.query.produto, tipo: "entrada" } })
})

// POST /movimentacoes/nova - registra uma entrada ou saída
router.post("/nova", function (req, res) {
    let erros = []
    let quantidade = Number(req.body.quantidade)    // o formulário sempre envia texto

    // 1) Validação do formulário (Forma 1 da aula 13)
    if (!req.body.produto || req.body.produto == "0") {
        erros.push({ texto: "Selecione um produto" })
    }
    if (req.body.tipo != "entrada" && req.body.tipo != "saida") {
        erros.push({ texto: "Tipo inválido: escolha entrada ou saída" })
    }
    if (!req.body.quantidade || !Number.isInteger(quantidade) || quantidade <= 0) {
        erros.push({ texto: "Quantidade inválida: informe um número inteiro maior que zero" })
    }
    if (erros.length > 0) {
        return renderFormulario(res, { erros: erros, movimentacao: req.body })
    }

    // 2) Busca o produto para conferir e atualizar o estoque
    Produto.findOne({ _id: req.body.produto }).then(function (produto) {
        if (!produto) {
            return renderFormulario(res, { erros: [{ texto: "Produto não encontrado" }], movimentacao: req.body })
        }
        // 3) REGRA DE NEGÓCIO: não pode sair mais do que tem no estoque.
        //    Nada é alterado no banco, só mostra o erro
        if (req.body.tipo == "saida" && quantidade > produto.quantidade) {
            return renderFormulario(res, {
                erros: [{ texto: "Estoque insuficiente: " + produto.nome + " tem apenas " + produto.quantidade + " unidade(s)" }],
                movimentacao: req.body
            })
        }
        // 4) Atualiza a quantidade: entrada soma, saída subtrai
        if (req.body.tipo == "entrada") {
            produto.quantidade = produto.quantidade + quantidade
        } else {
            produto.quantidade = produto.quantidade - quantidade
        }
        // 5) Salva o produto e depois registra a movimentação no histórico
        // Obs.: não usamos transação; se o 2º save falhar, o estoque muda sem registro no histórico (simplificação do projeto)
        return produto.save().then(function () {
            const novaMovimentacao = {
                produto: produto._id,
                tipo: req.body.tipo,
                quantidade: quantidade,
                observacao: req.body.observacao
            }
            return new Movimentacao(novaMovimentacao).save()
        }).then(function () {
            req.flash("success_msg", "Movimentação registrada! Estoque atual de " + produto.nome + ": " + produto.quantidade)
            res.redirect("/movimentacoes")
        })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao registrar a movimentação")
        res.redirect("/movimentacoes")
    })
})

module.exports = router
