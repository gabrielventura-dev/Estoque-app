// Popula o banco com dados de exemplo para a demonstração: npm run seed
// ATENÇÃO: apaga todos os dados atuais antes de inserir os novos
const mongoose = require("mongoose")
// Registra os models (mesmos usados pelo app.js)
require("./models/Categoria")
require("./models/Fornecedor")
require("./models/Produto")
require("./models/Movimentacao")
let Categoria = mongoose.model("categorias")
let Fornecedor = mongoose.model("fornecedores")
let Produto = mongoose.model("produtos")
let Movimentacao = mongoose.model("movimentacoes")

// Guardam os documentos inseridos, para usar os _id nos produtos
let categorias, fornecedores

// Data de "n" horas atrás (para o histórico ficar em ordem)
function horasAtras(n) {
    return new Date(Date.now() - n * 60 * 60 * 1000)
}

// Cada .then() espera o passo anterior terminar e retorna a próxima Promise
mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/estoque").then(function () {
    console.log("Conectado ao MongoDB, limpando coleções...")
    return Promise.all([
        Categoria.deleteMany({}),
        Fornecedor.deleteMany({}),
        Produto.deleteMany({}),
        Movimentacao.deleteMany({})
    ])
}).then(function () {
    // insertMany insere vários documentos de uma vez
    return Categoria.insertMany([
        { nome: "Bebidas", slug: "bebidas" },
        { nome: "Limpeza", slug: "limpeza" },
        { nome: "Mercearia", slug: "mercearia" },
        { nome: "Higiene", slug: "higiene" }
    ])
}).then(function (resultado) {
    categorias = resultado
    return Fornecedor.insertMany([
        { nome: "Distribuidora Borborema", cnpj: "12.345.678/0001-90", telefone: "(83) 3333-1000", email: "vendas@borborema.com" },
        { nome: "Atacado Campina", cnpj: "98.765.432/0001-10", telefone: "(83) 3333-2000", email: "contato@atacadocampina.com" },
        { nome: "Limpa Tudo Ltda", cnpj: "11.222.333/0001-44", telefone: "(83) 3333-3000", email: "pedidos@limpatudo.com" }
    ])
}).then(function (resultado) {
    fornecedores = resultado
    // categorias[0] = Bebidas, [1] = Limpeza, [2] = Mercearia, [3] = Higiene
    // fornecedores[0] = Borborema, [1] = Atacado Campina, [2] = Limpa Tudo
    return Produto.insertMany([
        { nome: "Refrigerante Cola 2L", codigo: "BEB-001", descricao: "Garrafa PET 2 litros", preco: 9.5, quantidade: 40, estoqueMinimo: 10, categoria: categorias[0]._id, fornecedor: fornecedores[0]._id },
        { nome: "Água Mineral 500ml", codigo: "BEB-002", descricao: "Sem gás", preco: 2.5, quantidade: 3, estoqueMinimo: 12, categoria: categorias[0]._id, fornecedor: fornecedores[0]._id },
        { nome: "Suco de Uva 1L", codigo: "BEB-003", descricao: "Integral", preco: 12.9, quantidade: 15, estoqueMinimo: 5, categoria: categorias[0]._id, fornecedor: fornecedores[1]._id },
        { nome: "Detergente 500ml", codigo: "LIM-001", descricao: "Neutro", preco: 2.99, quantidade: 4, estoqueMinimo: 6, categoria: categorias[1]._id, fornecedor: fornecedores[2]._id },
        { nome: "Água Sanitária 1L", codigo: "LIM-002", descricao: "", preco: 4.5, quantidade: 25, estoqueMinimo: 5, categoria: categorias[1]._id, fornecedor: fornecedores[2]._id },
        { nome: "Arroz Branco 5kg", codigo: "MER-001", descricao: "Tipo 1", preco: 27.9, quantidade: 18, estoqueMinimo: 5, categoria: categorias[2]._id, fornecedor: fornecedores[1]._id },
        { nome: "Feijão Carioca 1kg", codigo: "MER-002", descricao: "Tipo 1", preco: 8.49, quantidade: 5, estoqueMinimo: 8, categoria: categorias[2]._id, fornecedor: fornecedores[1]._id },
        { nome: "Sabonete 90g", codigo: "HIG-001", descricao: "Erva-doce", preco: 1.99, quantidade: 60, estoqueMinimo: 15, categoria: categorias[3]._id, fornecedor: fornecedores[1]._id }
    ])
}).then(function (produtos) {
    // As quantidades acima já consideram estas movimentações
    return Movimentacao.insertMany([
        { produto: produtos[0]._id, tipo: "entrada", quantidade: 48, observacao: "Compra inicial NF 1001", date: horasAtras(50) },
        { produto: produtos[0]._id, tipo: "saida", quantidade: 8, observacao: "Vendas do dia", date: horasAtras(30) },
        { produto: produtos[1]._id, tipo: "saida", quantidade: 21, observacao: "Venda para evento", date: horasAtras(20) },
        { produto: produtos[3]._id, tipo: "saida", quantidade: 6, observacao: "Vendas do dia", date: horasAtras(10) },
        { produto: produtos[5]._id, tipo: "entrada", quantidade: 20, observacao: "Compra NF 1002", date: horasAtras(2) }
    ])
}).then(function () {
    console.log("Banco populado com sucesso!")
    return mongoose.disconnect() // fecha a conexão para o script terminar
}).catch(function (erro) {
    console.log("Erro ao popular o banco: " + erro)
    return mongoose.disconnect()
})
