# Sistema de Controle de Estoque

Projeto da disciplina **Back-end Frameworks** (Prof. Allan Vilar, UNINASSAU Campina Grande).
Aplicação web para cadastrar categorias, fornecedores e produtos e registrar entradas e saídas de estoque.

**Tecnologias:** Node.js, Express, express-handlebars, Bootstrap 5, MongoDB + Mongoose, body-parser, express-session, connect-flash e nodemon.

## Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou superior
- [MongoDB](https://www.mongodb.com/try/download/community) rodando em `127.0.0.1:27017`
  - Alternativa com Docker: `docker run -d -p 27017:27017 --name mongo mongo`

## Como rodar

```bash
cd controle-estoque
npm install        # instala as dependências
npm run seed       # (opcional) apaga o banco "estoque" e insere dados de exemplo
npm run dev        # inicia com nodemon (reinicia ao salvar arquivos)
# ou: npm start    # inicia com node
```

Acesse **http://localhost:8081**.

Variáveis de ambiente opcionais:

| Variável    | Padrão                                  |
|-------------|-----------------------------------------|
| `PORT`      | `8081`                                  |
| `MONGO_URL` | `mongodb://127.0.0.1:27017/estoque`     |

## Estrutura (MVC)

```
app.js            configuração do Express, Handlebars, sessão, flash, middlewares, Mongoose e rotas
models/           Model: schemas do Mongoose (Categoria, Fornecedor, Produto, Movimentacao)
routes/           Controller: grupos de rotas com express.Router()
views/            View: templates Handlebars (layout main + parcial _msg)
public/           arquivos estáticos (css/style.css e js/script.js)
seed.js           dados de exemplo
docs/             documentação (visão, modelagem, protótipos, roteiro da apresentação)
```

## Funcionalidades

- Dashboard com totais, valor em estoque, produtos com estoque baixo e últimas movimentações
- CRUD de categorias, fornecedores e produtos (com busca por nome/código)
- Entrada e saída de estoque, com bloqueio de saída maior que o estoque disponível
- Não deixa apagar categoria/fornecedor que tenha produtos vinculados
