// JavaScript do front-end: roda no NAVEGADOR (não no servidor).
// É carregado no fim do layout main.handlebars, depois que a página já foi montada

// 1) Pede confirmação antes de deletar
// Todos os formulários de deletar têm a classe "form-deletar"
document.querySelectorAll(".form-deletar").forEach(function (form) {
    form.addEventListener("submit", function (evento) {
        // confirm() abre uma caixa com OK/Cancelar e devolve true ou false
        if (!confirm("Tem certeza que deseja deletar?")) {
            evento.preventDefault() // cancela o envio do formulário
        }
    })
})

// 2) Destaca produtos com estoque baixo (quantidade <= estoque mínimo)
// O servidor coloca os valores em data-quantidade e data-minimo, e aqui lemos com dataset
document.querySelectorAll("[data-quantidade]").forEach(function (elemento) {
    let quantidade = Number(elemento.dataset.quantidade)
    let minimo = Number(elemento.dataset.minimo)
    let situacao = elemento.querySelector(".situacao")  // célula/span onde vai o selo
    if (quantidade <= minimo) {
        elemento.classList.add("estoque-baixo")         // pinta a linha de vermelho (style.css)
        if (situacao) situacao.innerHTML = '<span class="badge bg-danger">Estoque baixo</span>'
    } else {
        if (situacao) situacao.innerHTML = '<span class="badge bg-success">OK</span>'
    }
})

// 3) Formata o preço ao sair do campo (evento "blur"): "10,5" -> "10.50"
document.querySelectorAll(".preco").forEach(function (campo) {
    campo.addEventListener("blur", function () {
        let valor = Number(campo.value.replace(",", "."))
        if (campo.value != "" && !isNaN(valor)) {
            campo.value = valor.toFixed(2)  // sempre com 2 casas decimais
        }
    })
})
