// Rotas de Produtos - prefixo "/produtos" (definido no app.js)
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
let Produto = mongoose.model("produtos")
let Categoria = mongoose.model("categorias")
let Fornecedor = mongoose.model("fornecedores")
let Movimentacao = mongoose.model("movimentacoes")

// Converte texto em número aceitando vírgula (ex.: "10,50" -> 10.5)
// Number("abc") dá NaN (Not a Number), que a validação trata como erro
function numero(valor) {
    return Number(String(valor).replace(",", "."))
}

// Validação do formulário (Forma 1 da aula 13).
// "novo" = true no cadastro; na edição a quantidade não é validada (não pode ser editada)
function validar(body, novo) {
    let erros = []
    if (!body.nome || body.nome.trim() == "") {
        erros.push({ texto: "Nome inválido" })
    } else if (body.nome.trim().length < 2) {
        erros.push({ texto: "Nome do produto é muito curto" })
    }
    if (!body.codigo || body.codigo.trim() == "") {
        erros.push({ texto: "Código (SKU) inválido" })
    }
    // isNaN = "não é um número"
    if (!body.preco || isNaN(numero(body.preco)) || numero(body.preco) < 0) {
        erros.push({ texto: "Preço inválido: informe um número maior ou igual a zero" })
    }
    // a quantidade só é informada no cadastro; depois ela muda pelas movimentações
    if (novo && (body.quantidade === "" || !Number.isInteger(Number(body.quantidade)) || Number(body.quantidade) < 0)) {
        erros.push({ texto: "Quantidade inválida: informe um número inteiro maior ou igual a zero" })
    }
    if (body.estoqueMinimo === "" || !Number.isInteger(Number(body.estoqueMinimo)) || Number(body.estoqueMinimo) < 0) {
        erros.push({ texto: "Estoque mínimo inválido: informe um número inteiro maior ou igual a zero" })
    }
    // "0" é o valor da opção "Selecione..." do <select>
    if (!body.categoria || body.categoria == "0") {
        erros.push({ texto: "Selecione uma categoria" })
    }
    if (!body.fornecedor || body.fornecedor == "0") {
        erros.push({ texto: "Selecione um fornecedor" })
    }
    return erros
}

// Carrega categorias e fornecedores (para preencher os <select>) e renderiza o formulário.
// Usada no cadastro e na edição, inclusive quando o formulário volta com erros
function renderFormulario(res, view, dados) {
    Promise.all([
        Categoria.find().sort({ nome: 'asc' }).lean(),
        Fornecedor.find().sort({ nome: 'asc' }).lean()
    ]).then(function (listas) {
        dados.categorias = listas[0]
        dados.fornecedores = listas[1]
        res.render(view, dados)
    }).catch(function (erro) {
        res.render(view, dados)
    })
}

// GET /produtos - lista, com busca por nome ou código (/produtos?busca=texto)
router.get("/", function (req, res) {
    let filtro = {}                 // filtro vazio = traz todos
    let busca = req.query.busca     // req.query lê o que vem depois do "?" na URL
    if (busca) {
        // escapa caracteres especiais para a busca ser por texto simples;
        // "i" = ignora maiúsculas/minúsculas
        let regex = new RegExp(busca.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        // $or: o nome OU o código precisa conter o texto buscado
        filtro = { $or: [{ nome: regex }, { codigo: regex }] }
    }
    // populate troca o _id da categoria/fornecedor pelo documento completo
    Produto.find(filtro).populate("categoria").populate("fornecedor").sort({ date: 'desc' }).lean().then(function (produtos) {
        res.render("produtos/lista", { produtos: produtos, busca: busca })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao listar os produtos")
        res.redirect("/")
    })
})

// GET /produtos/novo - formulário de cadastro (já com valores padrão)
router.get("/novo", function (req, res) {
    renderFormulario(res, "produtos/novo", { produto: { quantidade: 0, estoqueMinimo: 5 } })
})

// POST /produtos/novo - valida, confere se o código é único e salva
router.post("/novo", function (req, res) {
    let erros = validar(req.body, true)
    if (erros.length > 0) {
        return renderFormulario(res, "produtos/novo", { erros: erros, produto: req.body })
    }
    // código precisa ser único: verifica antes de salvar para mostrar um erro amigável
    Produto.findOne({ codigo: req.body.codigo.trim() }).then(function (existente) {
        if (existente) {
            return renderFormulario(res, "produtos/novo", {
                erros: [{ texto: "Já existe um produto com o código " + req.body.codigo }],
                produto: req.body
            })
        }
        // Converte os textos do formulário para os tipos certos antes de salvar
        const novoProduto = {
            nome: req.body.nome.trim(),
            codigo: req.body.codigo.trim(),
            descricao: req.body.descricao,
            preco: numero(req.body.preco),
            quantidade: Number(req.body.quantidade),
            estoqueMinimo: Number(req.body.estoqueMinimo),
            categoria: req.body.categoria,      // _id da categoria escolhida no <select>
            fornecedor: req.body.fornecedor     // _id do fornecedor escolhido no <select>
        }
        return new Produto(novoProduto).save().then(function () {
            req.flash("success_msg", "Produto cadastrado com sucesso!")
            res.redirect("/produtos")
        })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao salvar o produto")
        res.redirect("/produtos")
    })
})

// GET /produtos/editar/:id - formulário preenchido
router.get("/editar/:id", function (req, res) {
    Produto.findOne({ _id: req.params.id }).lean().then(function (produto) {
        if (!produto) {
            req.flash("error_msg", "Este produto não existe")
            return res.redirect("/produtos")
        }
        renderFormulario(res, "produtos/editar", { produto: produto })
    }).catch(function (erro) {
        req.flash("error_msg", "Este produto não existe")
        res.redirect("/produtos")
    })
})

// POST /produtos/editar - busca -> altera os campos -> save()
router.post("/editar", function (req, res) {
    let erros = validar(req.body, false)
    let produtoForm = req.body
    produtoForm._id = req.body.id   // a view usa produto._id no campo hidden
    if (erros.length > 0) {
        return renderFormulario(res, "produtos/editar", { erros: erros, produto: produtoForm })
    }
    // procura OUTRO produto (_id diferente, $ne = "not equal") usando o mesmo código
    Produto.findOne({ codigo: req.body.codigo.trim(), _id: { $ne: req.body.id } }).then(function (existente) {
        if (existente) {
            return renderFormulario(res, "produtos/editar", {
                erros: [{ texto: "Já existe outro produto com o código " + req.body.codigo }],
                produto: produtoForm
            })
        }
        return Produto.findOne({ _id: req.body.id }).then(function (produto) {
            produto.nome = req.body.nome.trim()
            produto.codigo = req.body.codigo.trim()
            produto.descricao = req.body.descricao
            produto.preco = numero(req.body.preco)
            produto.estoqueMinimo = Number(req.body.estoqueMinimo)
            produto.categoria = req.body.categoria
            produto.fornecedor = req.body.fornecedor
            // a quantidade NÃO é alterada aqui: só muda pelas movimentações
            return produto.save().then(function () {
                req.flash("success_msg", "Produto editado com sucesso!")
                res.redirect("/produtos")
            })
        })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao editar o produto")
        res.redirect("/produtos")
    })
})

// POST /produtos/deletar - remove o produto e o histórico de movimentações dele
router.post("/deletar", function (req, res) {
    Produto.deleteOne({ _id: req.body.id }).then(function () {
        // deleteMany apaga todas as movimentações ligadas a este produto
        return Movimentacao.deleteMany({ produto: req.body.id })
    }).then(function () {
        req.flash("success_msg", "Produto deletado com sucesso!")
        res.redirect("/produtos")
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao deletar o produto")
        res.redirect("/produtos")
    })
})

// GET /produtos/:id - detalhe do produto + histórico de movimentações
// (fica por último para "/novo" e "/editar" não serem confundidos com um :id)
router.get("/:id", function (req, res) {
    Produto.findOne({ _id: req.params.id }).populate("categoria").populate("fornecedor").lean().then(function (produto) {
        if (!produto) {
            req.flash("error_msg", "Este produto não existe")
            return res.redirect("/produtos")
        }
        // Busca só as movimentações deste produto, mais recentes primeiro
        return Movimentacao.find({ produto: produto._id }).sort({ date: 'desc' }).lean().then(function (movimentacoes) {
            res.render("produtos/detalhe", { produto: produto, movimentacoes: movimentacoes })
        })
    }).catch(function (erro) {
        req.flash("error_msg", "Este produto não existe")
        res.redirect("/produtos")
    })
})

module.exports = router
