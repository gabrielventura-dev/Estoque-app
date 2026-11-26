# Documento de Visão — Sistema de Controle de Estoque

Disciplina: Back-end Frameworks — Prof. Allan Vilar — UNINASSAU Campina Grande
Tema: Desenvolvimento de uma aplicação Web

---

## 1. Descrição do sistema

**Problema que resolve**
Pequenos comércios (mercadinhos, lojas de materiais, papelarias) costumam controlar o estoque em cadernos ou planilhas soltas. Isso gera falta de produto na prateleira, compras desnecessárias, divergência entre o que o sistema diz e o que existe de fato, e nenhum histórico de quem entrou ou saiu com mercadoria.

**Objetivo**
Oferecer uma aplicação web simples para cadastrar produtos, categorias e fornecedores, registrar todas as **entradas** e **saídas** de mercadoria e mostrar, em um painel (dashboard), a situação atual do estoque: quantidade de itens, valor total parado em estoque, produtos abaixo do estoque mínimo e últimas movimentações.

**Público-alvo**
Pequenas e médias lojas que precisam de um controle de estoque básico, acessível pelo navegador, sem custo de licença. Os usuários são o gerente da loja, o operador de estoque e o responsável pelas compras.

---

## 2. Descrição das funcionalidades

### Requisitos funcionais

| Código | Requisito |
|---|---|
| RF01 | O sistema deve exibir um dashboard com o total de produtos, categorias, fornecedores e o valor total em estoque (soma de preço × quantidade). |
| RF02 | O sistema deve listar no dashboard os produtos com estoque baixo (quantidade menor ou igual ao estoque mínimo) e as 5 últimas movimentações. |
| RF03 | O sistema deve permitir cadastrar, listar, editar e excluir categorias (nome e slug). |
| RF04 | O sistema deve impedir a exclusão de uma categoria que tenha produtos vinculados, mostrando uma mensagem de erro. |
| RF05 | O sistema deve permitir cadastrar, listar, editar e excluir fornecedores (nome, CNPJ, telefone e e-mail). |
| RF06 | O sistema deve impedir a exclusão de um fornecedor que tenha produtos vinculados, mostrando uma mensagem de erro. |
| RF07 | O sistema deve permitir cadastrar, listar, editar e excluir produtos, informando a quantidade inicial apenas no cadastro. |
| RF08 | O sistema deve garantir que o código (SKU) de cada produto seja único, exibindo um erro amigável se já existir. |
| RF09 | O sistema deve permitir buscar produtos por nome ou código na listagem. |
| RF10 | O sistema deve mostrar o detalhe de um produto com todo o seu histórico de movimentações. |
| RF11 | O sistema deve registrar entradas de estoque, somando a quantidade ao produto. |
| RF12 | O sistema deve registrar saídas de estoque, subtraindo a quantidade do produto, e bloquear saídas maiores que o estoque disponível. |
| RF13 | O sistema deve listar o histórico de todas as movimentações, das mais recentes para as mais antigas. |
| RF14 | O sistema deve destacar visualmente os produtos com estoque baixo na listagem. |
| RF15 | O sistema deve validar os formulários (campos vazios, nome com menos de 2 caracteres, preço e quantidades negativos ou não numéricos) e exibir as mensagens de erro na própria tela. |

### Requisitos não funcionais

| Código | Requisito |
|---|---|
| RNF01 | A aplicação deve ser desenvolvida em Node.js com Express, seguindo o padrão MVC (models, views e routes separados). |
| RNF02 | Os dados devem ser armazenados em banco MongoDB, acessado pelo Mongoose. |
| RNF03 | A interface deve ser responsiva (Bootstrap 5), funcionando em computador e celular. |
| RNF04 | Toda ação do usuário (salvar, editar, excluir, erro) deve gerar uma mensagem de retorno visível (mensagens flash). |

---

## 3. Perfil do usuário

| Descrição | Tipo | Responsabilidade |
|---|---|---|
| **Administrador** — gerente da loja | Usuário avançado (acesso total) | Mantém categorias, fornecedores e produtos; acompanha o dashboard, o valor em estoque e o histórico; decide sobre exclusões. |
| **Estoquista** — operador de estoque | Usuário operacional | Registra entradas (recebimento de mercadoria) e saídas (vendas, perdas, uso interno); consulta produtos e o histórico de movimentações. |
| **Comprador** — responsável por fornecedores e reposição | Usuário intermediário (compras) | Mantém o cadastro de fornecedores e produtos; acompanha o alerta de estoque baixo para fazer pedidos de reposição; registra a entrada das compras. |

> Observação: os perfis foram definidos para a análise do sistema. Nesta versão não há tela de login (o tema não foi abordado em aula), então todas as telas ficam acessíveis.

---

## 4. Tecnologias

| Nome | Descrição de uso |
|---|---|
| **HTML** | Estrutura de todas as páginas, escrita dentro das views `.handlebars` (tabelas, formulários, cards). |
| **CSS** | Arquivo próprio `public/css/style.css`, servido como arquivo estático, com ajustes visuais (cards do dashboard, destaque de estoque baixo). |
| **Bootstrap 5** | Framework front-end carregado via CDN no layout `main.handlebars`. Usado na navbar, grid, cards, tabelas, botões (`btn btn-success`), formulários (`form-control`) e alertas (`alert alert-danger`). |
| **JavaScript** | No front-end (`public/js/script.js`): pede confirmação com `confirm()` antes de excluir, destaca linhas com estoque baixo e formata o preço ao sair do campo. No back-end: toda a lógica do servidor. |
| **Node.js** | Ambiente que executa o JavaScript no servidor; roda o `app.js` e o `seed.js`. |
| **Express** | Framework web: cria o servidor (porta 8081), define as rotas, registra os middlewares e serve arquivos estáticos. As rotas são agrupadas com `express.Router()` em `routes/`. |
| **Handlebars (express-handlebars)** | Template engine das views. Layout padrão `main`, parcial `_msg` para mensagens, `{{#each}}` para listas e helpers próprios (`dinheiro`, `data`, `igual`). |
| **Mongoose** | Biblioteca de modelagem do MongoDB: define os Schemas (Categoria, Fornecedor, Produto, Movimentacao), valida tipos, faz consultas (`find`, `findOne`, `save`, `deleteOne`) e junta documentos relacionados com `populate`. |
| **MongoDB** | Banco de dados NoSQL onde ficam as coleções `categorias`, `fornecedores`, `produtos` e `movimentacoes` (banco `estoque`). |
| **body-parser** | Middleware que lê os dados enviados pelos formulários (POST) e os coloca em `req.body`. |
| **express-session** | Cria uma sessão para cada visitante no servidor; é necessária para o connect-flash guardar as mensagens entre um redirect e outro. |
| **connect-flash** | Guarda mensagens de sucesso/erro (`success_msg`, `error_msg`) que aparecem uma única vez, logo após um redirect. |
| **nodemon** | Dependência de desenvolvimento: reinicia o servidor automaticamente a cada alteração no código (`npm run dev`). |
