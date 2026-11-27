// Rotas de Fornecedores - prefixo "/fornecedores" (definido no app.js)
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
let Fornecedor = mongoose.model("fornecedores")
let Produto = mongoose.model("produtos")    // usado para checar se o fornecedor tem produtos

// Validação do formulário (Forma 1 da aula 13)
function validar(body) {
    let erros = []
    if (!body.nome || body.nome.trim() == "") {
        erros.push({ texto: "Nome inválido" })
    } else if (body.nome.trim().length < 2) {
        erros.push({ texto: "Nome do fornecedor é muito curto" })
    }
    // e-mail é opcional, mas se for preenchido precisa ter "@"
    if (body.email && body.email.indexOf("@") == -1) {
        erros.push({ texto: "E-mail inválido" })
    }
    return erros
}

// Pega só os campos do formulário que interessam (usado no cadastro e na edição)
function dadosDoFormulario(body) {
    return {
        nome: body.nome.trim(),
        cnpj: body.cnpj,
        telefone: body.telefone,
        email: body.email
    }
}

// GET /fornecedores - lista todos (mais recentes primeiro)
router.get("/", function (req, res) {
    Fornecedor.find().sort({ date: 'desc' }).lean().then(function (fornecedores) {
        res.render("fornecedores/lista", { fornecedores: fornecedores })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao listar os fornecedores")
        res.redirect("/")
    })
})

// GET /fornecedores/novo - formulário de cadastro
router.get("/novo", function (req, res) {
    res.render("fornecedores/novo")
})

// POST /fornecedores/novo - valida e salva
router.post("/novo", function (req, res) {
    let erros = validar(req.body)
    if (erros.length > 0) {
        res.render("fornecedores/novo", { erros: erros, fornecedor: req.body })
    } else {
        new Fornecedor(dadosDoFormulario(req.body)).save().then(function () {
            req.flash("success_msg", "Fornecedor cadastrado com sucesso!")
            res.redirect("/fornecedores")
        }).catch(function (erro) {
            req.flash("error_msg", "Houve um erro ao salvar o fornecedor, tente novamente!")
            res.redirect("/fornecedores")
        })
    }
})

// GET /fornecedores/editar/:id - formulário preenchido
router.get("/editar/:id", function (req, res) {
    Fornecedor.findOne({ _id: req.params.id }).lean().then(function (fornecedor) {
        if (!fornecedor) {
            req.flash("error_msg", "Este fornecedor não existe")
            return res.redirect("/fornecedores")
        }
        res.render("fornecedores/editar", { fornecedor: fornecedor })
    }).catch(function (erro) {
        req.flash("error_msg", "Este fornecedor não existe")
        res.redirect("/fornecedores")
    })
})

// POST /fornecedores/editar - busca -> altera os campos -> save()
router.post("/editar", function (req, res) {
    let erros = validar(req.body)
    if (erros.length > 0) {
        let fornecedor = req.body
        fornecedor._id = req.body.id    // a view usa fornecedor._id no campo hidden
        return res.render("fornecedores/editar", { erros: erros, fornecedor: fornecedor })
    }
    Fornecedor.findOne({ _id: req.body.id }).then(function (fornecedor) {
        let dados = dadosDoFormulario(req.body)
        fornecedor.nome = dados.nome
        fornecedor.cnpj = dados.cnpj
        fornecedor.telefone = dados.telefone
        fornecedor.email = dados.email
        return fornecedor.save().then(function () {
            req.flash("success_msg", "Fornecedor editado com sucesso!")
            res.redirect("/fornecedores")
        })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao editar o fornecedor")
        res.redirect("/fornecedores")
    })
})

// POST /fornecedores/deletar - protegido se houver produtos vinculados
router.post("/deletar", function (req, res) {
    Produto.countDocuments({ fornecedor: req.body.id }).then(function (total) {
        if (total > 0) {
            req.flash("error_msg", "Não é possível deletar: existem " + total + " produto(s) deste fornecedor")
            return res.redirect("/fornecedores")
        }
        return Fornecedor.deleteOne({ _id: req.body.id }).then(function () {
            req.flash("success_msg", "Fornecedor deletado com sucesso!")
            res.redirect("/fornecedores")
        })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao deletar o fornecedor")
        res.redirect("/fornecedores")
    })
})

module.exports = router
