const { response } = require("express");
const express = require("express");
const { request } = require("http");
const {v4:uuidv4} = require("uuid")
const app = express();

app.use(express.json());

let costumers = [];

function existCostumer(request, response, next){
    const {cpf} = request.headers;
    const costumer = costumers.find(costumer=> costumer.cpf == cpf);
    if(!costumer){
        return response.status(400).json({erro: "Costumer not found"});
    }
    request.costumer = costumer;
    next();
}

function getBalance(statement){
    const balance = statement.reduce((acc,operation)=>{
        if(operation.type == "credit"){
            return acc+ operation.amount;
        }
        else{
            return acc - operation.amount;
        }
    }, 0)

    return balance;
}

app.post("/account",(request,response)=>{
    let {nome,cpf} = request.body;
    const id = uuidv4();

    let costumerAlreadyExists = costumers.some(item=>item.cpf == cpf);
    if(costumerAlreadyExists){
        return response.status(400).json({erro : "Usuario já existente"});
    }

    costumers.push({
        nome,
        cpf,
        id,
        statement : []
    });

    return response.status(201).send();
})

app.get("/saldo/",existCostumer,(request,response)=>{
    const {costumer} = request; 
    return response.json(costumer.statement)
})

app.post("/deposit", existCostumer , (request,response)=>{
   let  =  {description,amount} = request.body;
   
   const {costumer} = request;
   
   const operation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
   }

   costumer.statement.push(operation);

   return response.status(201).send();
})

app.post("/withdraw", existCostumer, (request,response)=>{
    const {amount} = request.body;
    const {description} = request.body;
    const {costumer} = request;
    const balance = getBalance(costumer.statement);
    
    if(balance<amount){
        return response.status(400).json({error: "Fundos insuficientes!"})
    }
    
    const operation = {
        description,
        amount,
        created_at: new Date(),
        type: "debit"
       }

    costumer.statement.push(operation);

    return response.status(201).send();
})

app.get("/saldo/date",existCostumer,(request,response)=>{
    const {costumer} = request;
    const {date} = request.query; 
    const dateFormat = new Date(date + " 00:00");
    const statement = costumer.statement.filter((statement)=> statement.created_at.toDateString()=== new Date(dateFormat).toDateString());
    return response.json(costumer.statement);
})

app.put("/account", existCostumer ,(request,response)=>{
    const {nome} = request.body;
    const {costumer} = request;

    costumer.nome = nome;
    return response.status(201).send();
})

app.get("/account",existCostumer,(request,response)=>{
    const {costumer} = request;
    return response.status(201).json(costumer);
})

app.delete("/account", existCostumer , (request,response)=>{
    const {costumer} = request;
    costumers.splice(costumers.indexOf(costumer),1);

    return response.status(200).json(costumers);
})

app.get("/balance", existCostumer, (request,response)=>{
    const {costumer} = request;
    let balance = getBalance(costumer.statement);

    return response.status(200).json(balance);
})

app.listen(3031);