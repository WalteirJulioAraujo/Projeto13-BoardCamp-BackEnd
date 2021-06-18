import express from 'express';
import cors from 'cors';
import pg from 'pg';
import joi from 'joi';

const app = express();

app.use(cors());
app.use(express.json());

//Configuração do pg
const {Pool} =pg;

const connection = new Pool({
    user: 'bootcamp_role',
    password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp',
    host: 'localhost',
    port: 5432,
    database: 'boardcamp'
});

//Usando a Joi
const userSchema = joi.object({
    username: joi.string().required(),
    stockTotal: joi.number().integer().positive().required(),
    categoryId: joi.number().integer().positive().required(),
    pricePerDay: joi.number().integer().positive().required(),
    image: joi.string().pattern(/(https?:\/\/.*\.(?:png|jpg))/),
    id: joi.number().integer().positive()
})

//Create-Read-Update-Delete

//CRUD de categoria
//CREATE
app.post('/categories', async (req,res)=>{
    const { name } = req.body;
    
    const userSchema = joi.object({
        name: joi.string().alphanum().required()
    })

    const validate = userSchema.validate({name});
    if(validate.error){
        res.sendStatus(500);
        return;
    }

    try{
        const categoryName = name.trim();
        const categories = await connection.query('SELECT name FROM categories');
        const categoriesArray = categories.rows.map((e)=>e.name);
        if(categoriesArray.includes(categoryName)){
            res.sendStatus(409);
            return;
        }
        await connection.query('INSERT INTO categories (name) values ($1)',[categoryName]);
        res.send(201);
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
})

//READ
app.get('/categories', async (req,res)=>{
    const allCategories =  await connection.query('SELECT * FROM categories');
    res.send(allCategories.rows);
})

//CRUD Jogos
//Create
app.post('/games', async (req,res)=>{
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

    const userSchema = joi.object({
        name: joi.string().required(),
        stockTotal: joi.number().integer().positive().required(),
        categoryId: joi.number().integer().positive().required(),
        pricePerDay: joi.number().integer().positive().required(),
        image: joi.string().pattern(/(https?:\/\/.*\.(?:png|jpg))/)
    })
   
    const validate = userSchema.validate({name,image,stockTotal,categoryId,pricePerDay});
    if(validate.error){
        res.sendStatus(500);
        return;
    }

    try{
        const categories = await connection.query('SELECT id FROM categories');
        const categoriesArray = categories.rows.map((e)=>e.id);
        if(!categoriesArray.includes(categoryId)){
            console.log(4);
            res.sendStatus(400);
            return;
        }

        const games = await connection.query('SELECT name FROM games');
        const gamesArray = games.rows.map((e)=>e.name);
        const gameName = name.trim();
        if(gamesArray.includes(gameName)){
            res.sendStatus(409);
            return;
        }

        await connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") values ($1, $2, $3, $4, $5)`,[gameName, image, stockTotal, categoryId, pricePerDay]);
        res.send(201);

    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
})
//READ
app.get('/games', async (req,res)=>{
    try{
        const allGames = req.query?.name 
        ? await connection.query(`
        SELECT games.*,categories.name as "categoryName" 
        FROM games JOIN categories 
        ON games."categoryId"= categories.id
        WHERE games.name ILIKE $1
        `,[req.query.name+'%'])
        : await connection.query(`
            SELECT games.*,categories.name as "categoryName" 
            FROM games JOIN categories 
            ON games."categoryId"= categories.id
        `);
        res.send(allGames.rows);
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
})
//CRUD Clientes
//READ
app.get('/customers', async (req,res)=>{
    try{
        const allCustomers = req.query?.cpf
        ? await connection.query(`
            SELECT * FROM customers
            WHERE cpf ILIKE $1
        `,[req.query.cpf+'%'])
        : await connection.query(`
        SELECT * FROM customers
        `);
        res.send(allCustomers.rows);
    }catch(error){
        console.log(error);
        res.sendStatus(500);
        return;
    }
})

app.get('/customers/:id', async (req,res)=>{
    const id = Number(req.params?.id);
    const userSchema = joi.object({
        id: joi.number().integer().positive()
    })

    const validate = userSchema.validate({id});
    if(validate.error){
        res.sendStatus(500);
        return;
    }
    try{
        const customers = await connection.query('SELECT * FROM customers WHERE id=$1',[id]);
        if(!customers.rows.length){
            res.send(404);
            return;
        }
        res.send(customers.rows);
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
    
})
//POST
app.post('/customers', async (req,res)=>{

    const {name,phone,cpf} = req.body;
    let birthday = req.body.birthday
    birthday = birthday.substring(0,10);
   
    const userSchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().pattern(/^[1-9]{2}[0-9]{8,9}$/).required(),
        cpf: joi.string().pattern(/^[0-9]{11}$/).required(),
        birthday: joi.date().required()
    })

    const validate = userSchema.validate({name, phone, cpf, birthday});
    if(validate.error){
        res.sendStatus(400);
        return;
    }
    try{
        const allCpfs = await connection.query('SELECT * FROM customers WHERE cpf = $1',[cpf]);
        console.log(allCpfs.rows);
        if(allCpfs.rows.length){
            res.sendStatus(409);
            return;
        }

        await connection.query('INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4)',[name,phone,cpf,birthday]);
        res.sendStatus(201);
    }catch(error){
        return;
    }
})
app.put('/customers/:id', async (req,res)=>{
    const id = Number(req.params?.id);
    const {name,phone,cpf} = req.body;
    let birthday = req.body.birthday;
    birthday = birthday.substring(0,10);
   
    const userSchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().pattern(/^[1-9]{2}[0-9]{8,9}$/).required(),
        cpf: joi.string().pattern(/^[0-9]{11}$/).required(),
        birthday: joi.date().required(),
        id: joi.number().integer().positive()
    })

    const validate = userSchema.validate({name, phone, cpf, birthday, id});
    if(validate.error){
        res.sendStatus(400);
        return;
    }
    try{
        const allCpfs = await connection.query('SELECT * FROM customers WHERE cpf = $1',[cpf]);
        console.log(allCpfs.rows);
        if(allCpfs.rows.length){
            res.sendStatus(409);
            return;
        }
        const allIds = await connection.query('SELECT * FROM customers WHERE id = $1',[id]);
        if(!allIds.rows.length){
            res.sendStatus(404);
            return;
        }
        await connection.query('UPDATE customers SET name=$1,phone=$2,cpf=$3,birthday=$4 WHERE id=$5',[name, phone, cpf, birthday, id]);
        res.sendStatus(200)
    }catch(error){
        console(error);
        return;
    }
})

app.listen(4000,()=>{
    console.log("Running on port 4000");
})