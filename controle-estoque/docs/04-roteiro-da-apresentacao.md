# Roteiro da Apresentação

**Sistema de Controle de Estoque** — Back-end Frameworks — Prof. Allan Vilar
Tempo total sugerido: **~20 minutos** (+ perguntas)

## Visão geral

| Ordem | Parte | Tempo | Quem fala |
|---|---|---|---|
| 1 | Abertura + Documento de Visão | 4 min | Integrante 1 |
| 2 | Tecnologias e arquitetura (MVC) | 3 min | Integrante 2 |
| 3 | Modelagem de dados (classes e casos de uso) | 4 min | Integrante 3 |
| 4 | Protótipos das telas | 3 min | Integrante 4 |
| 5 | Execução do sistema (demo ao vivo) | 6 min | Integrante 5 (com o Integrante 4 no teclado) |
| — | Perguntas do professor | livre | Todos |

---

## Preparação (antes de começar)

1. MongoDB rodando (`mongod` ou serviço do MongoDB ligado).
2. Na pasta do projeto: `npm install` (só na primeira vez) e **`npm run seed`** para carregar os dados de exemplo.
3. `npm run dev` e abrir `http://localhost:8081` no navegador.
4. Deixar abertos: o navegador no Dashboard, o VS Code com `app.js` e o terminal (para mostrar o log do middleware).
5. Deixar os slides/arquivos de `docs/` abertos na ordem: 01 → 02 → 03.

---

## 1. Documento de Visão — Integrante 1 (4 min)

- **Abertura (30s):** "Nossa aplicação web é um Sistema de Controle de Estoque para pequenos comércios."
- **Problema e objetivo (1 min):** controle em caderno/planilha → falta de produto, compras erradas, sem histórico. Objetivo: cadastrar produtos e registrar todas as entradas e saídas, com um painel da situação do estoque.
- **Funcionalidades (1 min 30s):** passar rapidamente pelos RF01–RF15, destacando: dashboard com valor em estoque, alerta de estoque baixo, bloqueio de saída maior que o estoque, código único, busca. Citar os 4 requisitos não funcionais.
- **Perfis de usuário (1 min):** tabela Administrador / Estoquista / Comprador (tipo e responsabilidade). Avisar que login não foi implementado porque não foi visto em aula.

## 2. Tecnologias e arquitetura — Integrante 2 (3 min)

- Mostrar a tabela de tecnologias (seção 4 do Documento de Visão).
- Mostrar a **estrutura de pastas** no VS Code, explicando o MVC:
  - **Model** → `models/` (Schemas do Mongoose);
  - **View** → `views/` (Handlebars, layout `main`, parcial `_msg`);
  - **Controller** → `routes/` (cada arquivo é um `express.Router()`).
- Abrir o `app.js` e apontar: session + flash, middleware das mensagens, middleware de log, body-parser, handlebars, `mongoose.connect`, `express.static`, os `app.use` das rotas, a página 404 e o `listen` na última linha.

## 3. Modelagem de dados — Integrante 3 (4 min)

- **Diagrama de classes (2 min):** as 4 classes e seus atributos; relacionamentos 1..N (Categoria→Produto, Fornecedor→Produto, Produto→Movimentacao), explicando que no MongoDB isso é feito guardando o `ObjectId` com `ref` e buscando com `populate`.
- **Casos de uso (2 min):** diagrama (a) Gestão de Cadastros e (b) Movimentação e Consultas. Detalhar um caso de uso completo: **UC07 — Registrar Saída** (ator, pré-condição, fluxo principal e o fluxo de erro "estoque insuficiente").

## 4. Protótipos — Integrante 4 (3 min)

- Mostrar os wireframes do Dashboard, Lista de Produtos, Novo Produto e Nova Movimentação (`03-prototipos.md`).
- Explicar o layout comum: navbar, área de mensagens (`_msg`) e conteúdo.
- Comentar o que o JavaScript do front-end faz: `confirm()` antes de deletar, badge "Estoque baixo"/"OK" e formatação do preço.
- Gancho para a demo: "Agora vamos ver tudo isso funcionando."

## 5. Execução do sistema (demo ao vivo) — Integrante 5 (6 min)

Integrante 4 opera o computador; Integrante 5 narra.

1. **Dashboard** (`Início`): mostrar os 4 totais e o valor em estoque. Apontar o card vermelho **Estoque baixo** (Água Mineral 500ml, Detergente 500ml, Feijão Carioca 1kg) e as últimas movimentações.
2. **Terminal:** mostrar as linhas `Oi eu sou um Middleware: GET /` — é o middleware de log.
3. **Produtos:** mostrar a tabela com categoria e fornecedor (populate) e as linhas com badge **"Estoque baixo"**.
4. **Busca:** digitar `beb` → só aparecem as bebidas. Clicar em "Limpar".
5. **Validação:** "Novo produto" → clicar em "Cadastrar produto" com tudo vazio → aparecem os alertas vermelhos. Depois preencher nome `X` (1 letra) e preço `-5` → erros de nome curto e preço inválido.
6. **Código único:** preencher um produto válido com código `BEB-001` → "Já existe um produto com o código BEB-001". Trocar para `BEB-004` (ex.: "Cerveja Lata 350ml", preço `4,5` — mostrar que ao sair do campo vira `4.50`, quantidade 24, Bebidas, Distribuidora Borborema) → salvar → mensagem verde de sucesso.
7. **Entrada:** Movimentações → "Nova movimentação" → Água Mineral 500ml, **Entrada**, 20, "Compra NF 2001" → sucesso com o estoque atual. Voltar ao Dashboard: a Água Mineral **saiu do alerta** de estoque baixo.
8. **Saída bloqueada:** "Nova movimentação" → Detergente 500ml, **Saída**, 50 → mensagem **"Estoque insuficiente: Detergente 500ml tem apenas 4 unidade(s)"**; mostrar que o estoque não mudou.
9. **Saída válida:** Detergente 500ml, Saída, 2, "Venda balcão" → sucesso. Abrir o **detalhe do produto** e mostrar o histórico.
10. **Edição:** editar o produto criado (ex.: mudar o preço) e mostrar que a **quantidade está bloqueada** (só muda por movimentação).
11. **Bloqueio de exclusão:** Categorias → "Deletar" em **Bebidas** → confirmar no `confirm()` → mensagem "Não é possível deletar: existem N produto(s) nesta categoria".
12. **Exclusão permitida:** criar uma categoria "Teste" (slug `teste`) e deletá-la → sucesso. (Opcional: deletar o produto criado no passo 6.)
13. **404:** acessar `http://localhost:8081/qualquercoisa` → página 404.
14. **Fechamento (Integrante 1):** agradecer e abrir para perguntas.

---

## Perguntas que o professor pode fazer

**1. O que é MVC e onde está cada camada no projeto?**
É um padrão que separa a aplicação em Model (dados), View (interface) e Controller (lógica que liga os dois). Aqui: **Model** = `models/` (Schemas do Mongoose); **View** = `views/` (arquivos `.handlebars`); **Controller** = `routes/` (as funções de cada rota recebem a requisição, usam o model e renderizam a view).

**2. O que é middleware e qual vocês usaram?**
É uma função que roda entre a chegada da requisição e a resposta, recebendo `req`, `res` e `next`; ela faz algo e chama `next()` para seguir. Criamos dois no `app.js`: um que coloca as mensagens flash em `res.locals` e um de log que imprime método e URL ("Oi eu sou um Middleware"). Também usamos middlewares prontos: body-parser, express-session, connect-flash e `express.static`.

**3. Qual a diferença entre cookie e sessão?**
O cookie fica guardado **no navegador** do usuário. A sessão fica guardada **no servidor**; o navegador só guarda um cookie com o identificador da sessão. Por isso a sessão é mais segura para guardar dados.

**4. Para que serve o connect-flash?**
Para mostrar mensagens que aparecem uma única vez depois de um redirect (ex.: "Categoria criada com sucesso!"). A mensagem é gravada na sessão com `req.flash("success_msg", ...)`, lida no próximo carregamento e apagada em seguida. Ele depende do express-session.

**5. Por que usar o Router?**
Para agrupar as rotas por assunto em arquivos separados (`routes/categorias.js`, `routes/produtos.js`...) e registrar cada grupo com um prefixo no `app.js` (`app.use("/categorias", categorias)`). Deixa o `app.js` limpo e o código organizado.

**6. O que é o Mongoose e o que é um Schema?**
O Mongoose é uma biblioteca (ODM) que conecta o Node.js ao MongoDB e permite trabalhar com os documentos como objetos. O Schema é o "molde" do documento: define os campos, tipos, obrigatoriedade e valores padrão (ex.: `preco: { type: Number, required: true, min: 0 }`). A partir dele criamos o model com `mongoose.model("produtos", Produto)`.

**7. O que é populate?**
No produto guardamos apenas o `_id` da categoria e do fornecedor. O `populate("categoria")` troca esse `_id` pelo documento completo da coleção referenciada (`ref: "categorias"`), assim conseguimos mostrar `categoria.nome` na tabela.

**8. Por que usar o body-parser?**
Porque o Express, sozinho, não lê o corpo das requisições POST. O body-parser lê os dados enviados pelo formulário e os coloca em `req.body` (ex.: `req.body.nome`), que usamos para validar e salvar.
