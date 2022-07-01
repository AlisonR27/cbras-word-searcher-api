const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();
const fs = require('fs');
const cors = require('cors');
const { workerData } = require('worker_threads');
require('dotenv').config();


async function connect() {
    if (global.connection)
        return global.connection.connect();

    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: 'postgres://fyazuind:r34WG7VcdfJvN4WplbWYHEk-hfyYELv1@isilo.db.elephantsql.com:5432/fyazuind'
    });

    //apenas testando a conexão
    const client = await pool.connect();
    console.log("Criou pool de conexões no PostgreSQL!");

    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);
    client.release();

    //guardando para usar sempre o mesmo
    global.connection = pool;
    return pool.connect();
}


async function connect() {
    if (global.connection)
        return global.connection.connect();
 
    const { Pool } = require('pg');
    const pool = new Pool({
        user: process.env.USER,
        host: process.env.URI,
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
        port: process.env.DB_PORT,
    });
 
    //apenas testando a conexão
    return pool.connect();
}


app.use(bodyParser.json());

app.use(cors({
    origin: ''
}))

app.use((req,res,next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

app.get('/', async function (req,res) {
    const db = await connect();
    const query = await db.query('SELECT * FROM words')
    console.log(query);
    res.send("Yup!");
});

app.post('/word', async function (req,res) {
    // Creating the select statement
    const request = req.body;
    let queryString = 'SELECT * FROM words where word in ('
    req.body.forEach(item => {
        queryString += `\'${item.word}\',`
    })
    queryString += ')'

    //Consuming the database
    const db = await connect();
    const query = await db.query(queryString);

    res.json(query.rows);
});

app.post('/word_insert_load', async function (req, res) {
    const db = await connect();
    if (!req.body.word || !req.body.rate) res.status(400);
    const words = require("../cbras-usage.json");
    let queryString = `INSERT INTO words (word, rate) VALUES `;

    for (let i = 0; i < words.length-1; i++) {
        queryString += `(\'${words[i].word}\', \'${words[i].rate}\'), `
    }
    queryString += `(\'${words[words.length-1].word}\', \'${words[words.length-1].rate}\');`;

    const db_response = await db.query(queryString);
    
    if (db_response.rowCount > 0) res.status(200);
    else res.status(500);
    res.send('Successful!')
})

app.post

module.exports = app;