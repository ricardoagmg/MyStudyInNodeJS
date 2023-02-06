const { response } = require("express");
const express = require("express");
const {v4:uuidv4} = require("uuid")
const app = express();

app.use(express.json());

let banco = [];

function existCostumer(request, response, next){
    const {cpf} = request.params;
    const costumer = banco.find(costumer=> costumer.cpf == cpf);
    if(!costumer){
        return response.status(400).json({erro: "Costumer not found"});
    }
    request.costumer = costumer;
    next();
}

app.post("/account",(request,response)=>{
    let {nome,cpf} = request.body;
    const id = uuidv4();

    let costumerAlreadyExists = banco.some(item=>item.cpf == cpf);
    if(costumerAlreadyExists){
        return response.status(400).json({erro : "Usuario já existente"});
    }

    banco.push({
        nome,
        cpf,
        id,
        statement : []
    });

    return response.status(201).send();
})

app.get("/saldo/:cpf",existCostumer,(request,response)=>{
    const {costumer} = request; 
    return response.json(costumer.statement)
})

app.listen(3031);