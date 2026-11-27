// =====================================================================
// app.js - arquivo principal: configura e inicia o servidor
// =====================================================================

// Carregando módulos
const express = require("express")                  // framework web do Node.js
const handlebars = require("express-handlebars")    // template engine (gera o HTML das views)
const bodyParser = require("body-parser")           // lê os dados enviados pelos formulários
const mongoose = require("mongoose")                // conecta e conversa com o MongoDB
const session = require("express-session")          // guarda dados do usuário no servidor
const flash = require("connect-flash")              // mensagens que aparecem uma única vez
const path = require("path")                        // módulo nativo do Node para montar caminhos de pastas
const app = express()                               // cria a aplicação Express

// Models: precisam ser carregados (registrados no Mongoose) ANTES das rotas,
// porque as rotas usam mongoose.model("nome_da_colecao") para pegá-los
require("./models/Categoria")
require("./models/Fornecedor")
require("./models/Produto")
require("./models/Movimentacao")
require("./models/Usuario")

// Grupos de rotas: cada arquivo da pasta routes exporta um express.Router()
const principal = require("./routes/principal")
const categorias = require("./routes/categorias")
const fornecedores = require("./routes/fornecedores")
const produtos = require("./routes/produtos")
const movimentacoes = require("./routes/movimentacoes")
const usuarios = require("./routes/usuarios")

// Configurações
    // Sessão: guarda dados do usuário no servidor entre requisições.
    // O navegador recebe só um cookie com o id da sessão.
    app.use(session({
        secret: process.env.SESSION_SECRET || "controleestoque",  // chave usada para assinar o cookie da sessão
        resave: true,               // salva a sessão a cada requisição
        saveUninitialized: true     // cria a sessão mesmo que ainda esteja vazia
    }))
    // Flash: mensagens guardadas na sessão que somem depois de lidas
    // (precisa vir DEPOIS da sessão, pois depende dela)
    app.use(flash())

    // Middleware: deixa as mensagens flash disponíveis em todas as views.
    // res.locals = variáveis globais que qualquer view consegue acessar
    app.use(function (req, res, next) {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        // Usuário logado (ou undefined): usado no menu do layout para mostrar "Sair"
        res.locals.usuario = req.session.usuario
        next() // passa para o próximo middleware/rota
    })

    // Middleware de log: mostra o método (GET/POST) e a URL de cada requisição
    app.use(function (req, res, next) {
        console.log("Oi eu sou um Middleware: " + req.method + " " + req.url)
        next()
    })

    // Body Parser: transforma os dados do formulário em um objeto em req.body
    app.use(bodyParser.urlencoded({ extended: true }))  // formulários HTML
    app.use(bodyParser.json())                          // requisições em JSON

    // Handlebars: template engine com layout padrão "main"
    // (views/layouts/main.handlebars envolve todas as páginas)
    app.engine("handlebars", handlebars.engine({
        defaultLayout: "main",
        // Helpers: pequenas funções que podem ser chamadas dentro das views
        helpers: {
            // Formata número como dinheiro: 10.5 -> R$ 10,50
            // Uso na view: {{dinheiro preco}}
            dinheiro: function (valor) {
                return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            },
            // Formata data no padrão brasileiro: 26/11/2026, 14:00:00
            // Uso na view: {{data date}}
            data: function (d) {
                return new Date(d).toLocaleString("pt-BR")
            },
            // Compara dois valores como texto (usado para marcar o <option> selecionado)
            // Uso na view: {{#if (igual a b)}} ... {{/if}}
            igual: function (a, b) {
                return String(a) === String(b)
            }
        }
    }))
    app.set("view engine", "handlebars") // diz ao Express que as views são .handlebars

    // Mongoose: conexão com o MongoDB (banco "estoque").
    // process.env.MONGO_URL permite trocar o endereço sem mexer no código
    mongoose.Promise = global.Promise
    mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/estoque").then(function () {
        console.log("Conectado ao MongoDB")
    }).catch(function (erro) {
        console.log("Erro ao se conectar ao MongoDB: " + erro)
    })

    // Arquivos estáticos: tudo da pasta public fica acessível pelo navegador
    // (ex.: public/css/style.css -> http://localhost:8081/css/style.css)
    // __dirname = pasta onde este arquivo está
    app.use(express.static(path.join(__dirname, "public")))

// Rotas: cada grupo recebe um prefixo
// (ex.: router.get("/nova") em categorias.js vira GET /categorias/nova)
// Login, criação de conta e logout: ficam ANTES da proteção, pois são abertas a todos
app.use("/", usuarios)

// Proteção: daqui para baixo, só entra quem fez login.
// Sem usuário na sessão, manda para a tela de login
app.use(function (req, res, next) {
    if (req.session.usuario) return next()
    req.flash("error_msg", "Faça login para acessar o sistema")
    res.redirect("/login")
})

app.use("/", principal)
app.use("/categorias", categorias)
app.use("/fornecedores", fornecedores)
app.use("/produtos", produtos)
app.use("/movimentacoes", movimentacoes)

// Página 404: se nenhuma rota acima respondeu, a página não existe
app.use(function (req, res) {
    res.status(404).render("404")
})

// Outros
// Porta do servidor: usa a variável PORT se existir, senão 8081
const PORT = process.env.PORT || 8081
app.listen(PORT, function () { console.log("Servidor rodando na url http://localhost:" + PORT) })
