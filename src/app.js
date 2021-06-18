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
    username: joi.string().alphanum().required(),
    stockTotal: joi.number().integer().positive().required(),
    categoryId: joi.number().integer().positive().required(),
    pricePerDay: joi.number().integer().positive().required(),
    image: joi.string().pattern(/(https?:\/\/.*\.(?:png|jpg))/)
})

//Create-Read-Update-Delete

//CRUD de categoria
//CREATE
app.post('/categories', async (req,res)=>{
    const { name } = req.body;
    
    const validate = userSchema.validate({username:name});
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
   
    const validate = userSchema.validate({username:name,image,stockTotal,categoryId,pricePerDay});
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
        ? await connection.query('SELECT * FROM games WHERE name ILIKE $1',[req.query.name+'%'])
        :await connection.query('SELECT * FROM games');
        
        const allCategories = await connection.query('SELECT * FROM categories');
        allGames.rows.map((e)=>{
            allCategories.rows.map((j)=>{
                if(e.id===j.id){
                    e.categoryName=j.name;
                    return;
                }
            })
        })
        
        res.send(allGames.rows);
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
})




app.listen(4000,()=>{
    console.log("Running on port 4000");
})