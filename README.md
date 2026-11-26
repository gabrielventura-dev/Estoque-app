# Estoque App

Sistema web de controle de estoque desenvolvido como projeto da disciplina de **Back-End Frameworks** — Uninassau.

---

## Sobre o projeto

O sistema permite gerenciar produtos, categorias e movimentações de estoque de forma simples e intuitiva. Conta com um painel de controle que exibe alertas de produtos com estoque baixo e o valor total em estoque.

## Funcionalidades

- **Login** — autenticação de usuário
- **Painel** — visão geral com total de produtos, estoque baixo e valor total
- **Produtos** — listagem, busca em tempo real e exclusão de produtos
- **Cadastrar Produto** — formulário para adicionar novos itens ao estoque
- **Categorias** — cadastro e listagem de categorias
- **Movimentações** — registro de entradas e saídas com histórico filtrável

## Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| Node.js | Plataforma de execução |
| Express | Framework back-end |
| Handlebars | Template engine (views) |
| Tailwind CSS | Estilização das interfaces |
| Poppins (Google Fonts) | Tipografia |
| Express Session | Controle de sessão do usuário |

## Como rodar o projeto

**Pré-requisitos:** Node.js instalado

```bash
# Clone o repositório
git clone https://github.com/gabrielventura-dev/Estoque-app.git

# Entre na pasta
cd Estoque-app

# Instale as dependências
npm install

# Inicie o servidor
node app.js
```

Acesse em: `http://localhost:3000`

## Estrutura de pastas

```
Estoque-app/
├── public/
│   └── css/
│       └── style.css        # Estilos globais
├── views/
│   ├── layouts/
│   │   └── main.handlebars  # Layout principal (navbar, footer)
│   ├── login.handlebars
│   ├── painel.handlebars
│   ├── produtos.handlebars
│   ├── cadastrar-produto.handlebars
│   ├── categorias.handlebars
│   └── movimentacoes.handlebars
├── .gitignore
├── package.json
└── README.md
```

## Equipe

| Nome | Responsabilidade |
|---|---|
| Gabriel Ventura | Front-end (views, CSS, layout) |
| Gabriel Rodrigues | Back-end (rotas, banco de dados) |

---

Projeto acadêmico — Uninassau · 2026
