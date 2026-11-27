// Rotas de Usuários: login, criação de conta e logout - prefixo "/" (definido no app.js)
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const crypto = require("crypto")        // módulo nativo do Node (não precisa instalar)
const util = require("util")
let Usuario = mongoose.model("usuarios")

// scrypt transforma a senha num "hash": dá para conferir a senha, mas não para descobri-la.
// promisify faz a função devolver uma Promise (para usar com .then)
const scrypt = util.promisify(crypto.scrypt)

// Gera o texto salvo no banco: "salt:hash".
// O salt é aleatório, então duas pessoas com a mesma senha ficam com hashes diferentes
function gerarHash(senha) {
    let salt = crypto.randomBytes(16).toString("hex")
    return scrypt(senha, salt, 64).then(function (hash) {
        return salt + ":" + hash.toString("hex")
    })
}

// Confere a senha digitada com o "salt:hash" salvo (devolve true ou false)
function conferirSenha(senha, salvo) {
    let partes = salvo.split(":")
    return scrypt(senha, partes[0], 64).then(function (hash) {
        // timingSafeEqual compara sem "vazar" pelo tempo quantos caracteres batem
        return crypto.timingSafeEqual(hash, Buffer.from(partes[1], "hex"))
    })
}

// Guarda o usuário na sessão. regenerate() troca o id da sessão ao entrar,
// para ninguém reaproveitar um cookie de sessão antigo
function entrar(req, res, usuario, mensagem) {
    req.session.regenerate(function (erro) {
        if (erro) {
            req.flash("error_msg", "Houve um erro ao entrar, tente novamente")
            return res.redirect("/login")
        }
        req.session.usuario = { _id: String(usuario._id), nome: usuario.nome, email: usuario.email }
        req.flash("success_msg", mensagem)
        res.redirect("/")
    })
}

// Validação do formulário de criar conta
function validar(body) {
    let erros = []
    if (!body.nome || body.nome.trim().length < 2) {
        erros.push({ texto: "Nome inválido" })
    }
    // Regex simples: algo@algo.algo
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
        erros.push({ texto: "E-mail inválido" })
    }
    if (!body.senha || body.senha.length < 6) {
        erros.push({ texto: "A senha deve ter pelo menos 6 caracteres" })
    }
    if (body.senha != body.senha2) {
        erros.push({ texto: "As senhas não conferem" })
    }
    return erros
}

// GET /login - formulário de login (quem já entrou vai direto para o dashboard)
router.get("/login", function (req, res) {
    if (req.session.usuario) return res.redirect("/")
    res.render("usuarios/login")
})

// POST /login - confere e-mail e senha
router.post("/login", function (req, res) {
    let email = (req.body.email || "").trim().toLowerCase()
    let senha = req.body.senha || ""
    Usuario.findOne({ email: email }).lean().then(function (usuario) {
        if (!usuario) return false
        return conferirSenha(senha, usuario.senha).then(function (ok) {
            return ok ? usuario : false
        })
    }).then(function (usuario) {
        if (!usuario) {
            // Mesma mensagem para e-mail ou senha errados: não revela qual dos dois falhou
            return res.render("usuarios/login", { erros: [{ texto: "E-mail ou senha incorretos" }], email: email })
        }
        entrar(req, res, usuario, "Bem-vindo(a), " + usuario.nome + "!")
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao entrar, tente novamente")
        res.redirect("/login")
    })
})

// GET /registro - formulário de criar conta
router.get("/registro", function (req, res) {
    if (req.session.usuario) return res.redirect("/")
    res.render("usuarios/registro")
})

// POST /registro - cria a conta e já entra no sistema
router.post("/registro", function (req, res) {
    let erros = validar(req.body)
    // Devolve o que foi digitado (menos as senhas) para o formulário não vir vazio
    let dados = { nome: req.body.nome, email: req.body.email }
    if (erros.length > 0) {
        return res.render("usuarios/registro", { erros: erros, usuario: dados })
    }
    let email = req.body.email.trim().toLowerCase()
    Usuario.findOne({ email: email }).then(function (existe) {
        if (existe) {
            return res.render("usuarios/registro", { erros: [{ texto: "Já existe uma conta com este e-mail" }], usuario: dados })
        }
        return gerarHash(req.body.senha).then(function (hash) {
            return new Usuario({ nome: req.body.nome.trim(), email: email, senha: hash }).save()
        }).then(function (usuario) {
            entrar(req, res, usuario, "Conta criada com sucesso! Bem-vindo(a), " + usuario.nome + "!")
        })
    }).catch(function (erro) {
        req.flash("error_msg", "Houve um erro ao criar a conta, tente novamente")
        res.redirect("/registro")
    })
})

// POST /logout - apaga a sessão (é POST para outro site não conseguir deslogar o usuário com um link)
router.post("/logout", function (req, res) {
    req.session.destroy(function () {
        res.redirect("/login")
    })
})

module.exports = router
