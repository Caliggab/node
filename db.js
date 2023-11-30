const {Pool} = require('pg');
require("dotenv").config();


const pool = new Pool({
    user: 'postgres',
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
})

module.exports = pool;