# Protótipos das Telas

Todas as telas usam o mesmo layout (`views/layouts/main.handlebars`): uma **navbar** escura no topo com os links *Início, Produtos, Categorias, Fornecedores, Movimentações*, a área de mensagens (`_msg`: alerta verde de sucesso ou vermelho de erro) e o conteúdo da página dentro de um `container` do Bootstrap.

---

## 1. Dashboard (`/`)

**Objetivo:** dar uma visão geral do estoque logo ao abrir o sistema.

**Elementos da tela:**
- 4 cards de totais: Produtos, Categorias, Fornecedores e Valor em estoque (R$).
- Card vermelho "Estoque baixo" com os produtos cuja quantidade ≤ estoque mínimo (nome, código e "qtd / mín.").
- Card "Últimas movimentações" com as 5 mais recentes (badge Entrada/Saída, produto, quantidade, data).
- Botão "Nova movimentação".

**Ações possíveis:** clicar em um produto do alerta para ver o detalhe; ir para "Nova movimentação"; navegar pelo menu.

```
+--------------------------------------------------------------------------+
| Controle de Estoque       Início  Produtos  Categorias  Fornec.  Movim.  |
+--------------------------------------------------------------------------+
|  Dashboard                                                               |
|  +------------+  +------------+  +--------------+  +------------------+  |
|  | Produtos   |  | Categorias |  | Fornecedores |  | Valor em estoque |  |
|  |    12      |  |     4      |  |      3       |  |   R$ 4.530,00    |  |
|  +------------+  +------------+  +--------------+  +------------------+  |
|  +-------------------------------+  +---------------------------------+  |
|  | ESTOQUE BAIXO       (vermelho)|  | Últimas movimentações           |  |
|  | Detergente (LIM-002)  [2/mín5]|  | [Entrada] Arroz 5kg   10 un.    |  |
|  | Café 500g  (ALI-003)  [3/mín5]|  | [Saída]   Refrig. 2L   4 un.    |  |
|  |                               |  | ...                             |  |
|  |                               |  | [ Nova movimentação ]           |  |
|  +-------------------------------+  +---------------------------------+  |
+--------------------------------------------------------------------------+
```

---

## 2. Lista de Produtos (`/produtos`)

**Objetivo:** consultar todos os produtos e chegar às ações de cada um.

**Elementos da tela:**
- Botão "Novo produto".
- Campo de busca "Buscar por nome ou código" + botão "Buscar" (e "Limpar" quando há busca ativa). A busca vai na URL: `/produtos?busca=texto`.
- Tabela: Código, Nome (link para o detalhe), Categoria, Fornecedor (nomes trazidos com `populate`), Preço, Qtd., Situação e botões.
- Coluna **Situação**: o `script.js` lê a quantidade e o mínimo de cada linha e mostra o badge vermelho **"Estoque baixo"** ou verde **"OK"**, além de destacar a linha.

**Ações possíveis:** buscar; abrir o detalhe; "Editar"; "Deletar" (com `confirm()` antes de enviar); "Novo produto".

```
+--------------------------------------------------------------------------+
|  Produtos                                            [ Novo produto ]    |
|  [ Buscar por nome ou código.....................] [Buscar] [Limpar]     |
|  +--------------------------------------------------------------------+  |
|  | Código  | Nome       | Categoria | Fornec. | Preço  | Qtd | Situação |  |
|  |---------|------------|-----------|---------|--------|-----|----------|  |
|  | BEB-001 | Refrig. 2L | Bebidas   | Distrib | R$8,99 | 30  | [OK]     |  |
|  |         |            |           |         |        |     |[Editar][Deletar]
|  | LIM-002 | Detergente | Limpeza   | Limpa+  | R$2,49 |  2  |[Estoque  |  |
|  |  (linha destacada)   |           |         |        |     |  baixo]  |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```

---

## 3. Novo Produto (`/produtos/novo`)

**Objetivo:** cadastrar um produto no estoque.

**Elementos da tela:**
- Alertas vermelhos com os erros de validação (quando houver), um por erro.
- Campos: Nome, Código (SKU), Descrição, Preço (R$) — formatado para 2 casas ao sair do campo —, Quantidade inicial, Estoque mínimo (padrão 5), Categoria (select) e Fornecedor (select).
- Botões "Cadastrar produto" e "Cancelar".

**Ações possíveis:** salvar (com validação no servidor; se houver erro, os dados digitados continuam no formulário); cancelar.

```
+--------------------------------------------------------------------------+
|  [!] Nome do produto é muito curto                       (alert-danger)  |
|  [!] Já existe um produto com o código BEB-001           (alert-danger)  |
|  Novo produto                                                            |
|  +--------------------------------------------------------------------+  |
|  | Nome: [...............................]  Código (SKU): [.........]  |  |
|  | Descrição: [.....................................................]  |  |
|  | Preço (R$): [0.00]   Quantidade inicial: [0]   Estoque mínimo: [5]  |  |
|  | Categoria: [Selecione...    v]   Fornecedor: [Selecione...      v]  |  |
|  | [ Cadastrar produto ] [ Cancelar ]                                  |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```

---

## 4. Editar Produto (`/produtos/editar/:id`)

**Objetivo:** alterar os dados cadastrais de um produto.

**Elementos da tela:** os mesmos do cadastro, já preenchidos, com a categoria e o fornecedor atuais selecionados. A **quantidade em estoque aparece desabilitada**, com o aviso "Use Movimentações para alterar" — o estoque só muda por entradas e saídas, para manter o histórico correto.

**Ações possíveis:** "Salvar alterações" (mesmas validações, incluindo código único entre os outros produtos); "Cancelar".

---

## 5. Detalhe do Produto (`/produtos/:id`)

**Objetivo:** ver todas as informações de um produto e o seu histórico.

**Elementos da tela:**
- Título com o nome e botões "Registrar movimentação" (já abre o formulário com o produto selecionado) e "Editar".
- Card com Código, Descrição, Categoria, Fornecedor, Preço e Estoque (atual e mínimo, com o badge de situação).
- Tabela "Histórico de movimentações" do produto: Data, Tipo, Quantidade, Observação.
- Botão "Voltar".

**Ações possíveis:** registrar movimentação, editar, voltar à lista.

---

## 6. Categorias (`/categorias`, `/categorias/nova`, `/categorias/editar/:id`)

**Objetivo:** manter as categorias dos produtos.

**Elementos da tela:**
- Lista: um card por categoria com nome, slug e botões "Editar" e "Deletar"; botão "Nova categoria".
- Formulários de nova/editar: campos Nome e Slug, alertas de erro, botões salvar e "Cancelar".

**Ações possíveis:** criar, editar e deletar (com confirmação). Se a categoria tiver produtos, a exclusão é bloqueada com mensagem vermelha.

---

## 7. Fornecedores (`/fornecedores`, `/fornecedores/novo`, `/fornecedores/editar/:id`)

**Objetivo:** manter os fornecedores.

**Elementos da tela:**
- Lista em tabela: Nome, CNPJ, Telefone, E-mail e botões "Editar"/"Deletar"; botão "Novo fornecedor".
- Formulários: Nome, CNPJ, Telefone, E-mail, alertas de erro, botões salvar e "Cancelar".

**Ações possíveis:** criar, editar e deletar (com confirmação). Fornecedor com produtos vinculados não pode ser excluído.

---

## 8. Nova Movimentação (`/movimentacoes/nova`)

**Objetivo:** registrar entrada ou saída de mercadoria.

**Elementos da tela:**
- Alertas de erro (inclusive "Estoque insuficiente: X tem apenas N unidade(s)").
- Select de Produto (mostra nome, código e estoque atual).
- Rádios Tipo: "Entrada (soma ao estoque)" / "Saída (subtrai do estoque)".
- Campo Quantidade (inteiro maior que zero) e Observação.
- Botões "Registrar" e "Cancelar".

**Ações possíveis:** registrar; cancelar. Uma saída maior que o estoque é bloqueada e nada é alterado.

```
+--------------------------------------------------------------------------+
|  [!] Estoque insuficiente: Detergente tem apenas 2 unidade(s)            |
|  Nova movimentação                                                       |
|  +--------------------------------------------------------------------+  |
|  | Produto: [Detergente (LIM-002) - estoque: 2                     v]  |  |
|  | Tipo:  ( ) Entrada (soma ao estoque)   (o) Saída (subtrai)         |  |
|  | Quantidade: [10]                                                    |  |
|  | Observação: [venda balcão......................................]   |  |
|  | [ Registrar ] [ Cancelar ]                                          |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```

---

## 9. Histórico de Movimentações (`/movimentacoes`)

**Objetivo:** consultar todas as entradas e saídas, das mais recentes para as mais antigas.

**Elementos da tela:** botão "Nova movimentação" e tabela com Data, Produto (link para o detalhe), Tipo (badge verde "Entrada" / amarelo "Saída"), Quantidade e Observação.

**Ações possíveis:** abrir o detalhe de um produto; registrar nova movimentação.

---

## Prints das telas reais

Para a entrega/apresentação, capture prints do sistema rodando e salve em **`docs/prints/`** (a pasta já existe):

1. Rode `npm run seed` e depois `npm run dev`, e abra `http://localhost:8081`.
2. Capture (sugestão de nomes):
   - `01-dashboard.png` — dashboard com totais e alerta de estoque baixo;
   - `02-produtos-lista.png` — lista com destaque de estoque baixo;
   - `03-produtos-busca.png` — busca por nome/código;
   - `04-produto-novo-erros.png` — formulário com erros de validação;
   - `05-produto-detalhe.png` — detalhe com histórico;
   - `06-categorias.png` e `07-fornecedores.png`;
   - `08-categoria-bloqueio.png` — mensagem ao tentar excluir categoria com produtos;
   - `09-movimentacao-saida-bloqueada.png` — "Estoque insuficiente";
   - `10-movimentacoes-historico.png`.
3. Dica: no navegador, `Ctrl+Shift+S` (Firefox) ou as ferramentas de desenvolvedor (Chrome → "Capture full size screenshot") capturam a página inteira.
