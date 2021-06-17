import express from 'express';
import cors from 'cors';
import pg from 'pg';

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
//Create-Read-Update-Delete

//CRUD de categoria
//CREATE
app.post('/categories', async (req,res)=>{
    const { name } = req.body;
    if(!name?.trim()){
        res.sendStatus(400);
        return;
    }
    try{
        const categories = await connection.query('SELECT name FROM categories');
        const categoriesArray = categories.rows.map((e)=>e.name);
        if(categoriesArray.includes(name)){
            res.sendStatus(409);
            return;
        }
        await connection.query('INSERT INTO categories (name) values ($1)',[name]);
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





app.listen(4000,()=>{
    console.log("Running on port 4000");
})