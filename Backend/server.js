const express = require('express')
const cors = require('cors')
const app = express();

const Port = 3000; //Ou 3001??

app.use(cors());
app.use(express());

// OBS: Usar mock de dados ao invés de uma variavel volatil


// Criar carrinho
// Atribuir estoque de cota ao carrinho

// Editar estoque de cotas (lembrar de ir atrás de tudo o que precisa ter em todo carrinho de emergência)

// Excluir carrinho

// Criar regra de acesso para o carrinho 
// Criar acesso

// Editar acesso

// Excluir acesso


// Rodar servidor backend
app.listen(Port, ()=>{
    console.log(`servidor rodando na porta ${Port}`)
})