// Rotas de Categorias - prefixo "/categorias" (definido no app.js)
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
let Categoria = mongoose.model("categorias")
let Produto = mongoose.model("produtos")    // usado para checar se a categoria tem produtos

// Validação do formulário (Forma 1 da aula 13): monta a lista de erros.
// Cada erro é um objeto { texto: "..." } exibido na view com {{#each erros}}
function validar(body) {
    let erros = []
    if (!body.nome || body.nome.trim() == "") {     // trim() remove espaços das pontas
        erros.push({ texto: "Nome inválido" })
    } else if (body.nome.trim().length < 2) {
        erros.push({ texto: "Nome da categoria é muito curto" })
    }
    if (!body.slug || body.slug.trim() == "") {
        erros.push({ texto: "Slug inválido" })
    }
    return erros
}

// GET /categorias - lista todas as categorias (mais recentes primeiro)
router.get("/", function (req, res) {
    // .lean() devolve objetos simples, que o Handlebars consegue ler
    Categoria.find().sort({ date: 'desc' }).lean().then(function (categorias) {
        res.render("categorias/lista", { categorias: categorias })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/")
    })
})

// GET /categorias/nova - mostra o formulário de cadastro
router.get("/nova", function (req, res) {
    res.render("categorias/nova")
})

// POST /categorias/nova - recebe o formulário e salva no banco
router.post("/nova", function (req, res) {
    let erros = validar(req.body)
    if (erros.length > 0) {
        // Tem erro: volta para o formulário mostrando os erros e o que foi digitado
        res.render("categorias/nova", { erros: erros, categoria: req.body })
    } else {
        const novaCategoria = {
            nome: req.body.nome.trim(),
            slug: req.body.slug.trim()
        }
        // new Model(dados).save() cria o documento no MongoDB
        new Categoria(novaCategoria).save().then(function () {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/categorias")
        }).catch(function (erro) {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/categorias")
        })
    }
})

// GET /categorias/editar/:id - mostra o formulário preenchido
// :id é um parâmetro da URL, lido com req.params.id
router.get("/editar/:id", function (req, res) {
    Categoria.findOne({ _id: req.params.id }).lean().then(function (categoria) {
        if (!categoria) {   // não achou nenhuma categoria com esse id
            req.flash("error_msg", "Esta categoria não existe")
            return res.redirect("/categorias")
        }
        res.render("categorias/editar", { categoria: categoria })
    }).catch(function (erro) {  // id em formato inválido também cai aqui
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/categorias")
    })
})

// POST /categorias/editar - salva a edição: busca -> altera os campos -> save()
router.post("/editar", function (req, res) {
    let erros = validar(req.body)
    if (erros.length > 0) {
        return res.render("categorias/editar", {
            erros: erros,
            categoria: { _id: req.body.id, nome: req.body.nome, slug: req.body.slug }
        })
    }
    // O id vem do <input type="hidden" name="id"> do formulário
    Categoria.findOne({ _id: req.body.id }).then(function (categoria) {
        categoria.nome = req.body.nome.trim()
        categoria.slug = req.body.slug.trim()
        return categoria.save().then(function () {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/categorias")
        })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/categorias")
    })
})

// POST /categorias/deletar - só deixa apagar se não houver produtos nesta categoria
router.post("/deletar", function (req, res) {
    // countDocuments conta quantos produtos usam esta categoria
    Produto.countDocuments({ categoria: req.body.id }).then(function (total) {
        if (total > 0) {
            req.flash("error_msg", "Não é possível deletar: existem " + total + " produto(s) nesta categoria")
            return res.redirect("/categorias")
        }
        return Categoria.deleteOne({ _id: req.body.id }).then(function () {
            req.flash("success_msg", "Categoria deletada com sucesso!")
            res.redirect("/categorias")
        })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/categorias")
    })
})

module.exports = router
