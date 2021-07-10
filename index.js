const express=require('express');
const app=express();
const cors=require('cors');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const login=require('./Router/index')
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const cookieSession = require('cookie-session');

app.use(cors({origin:process.env.FRONTEND_DOMAIN,credentials:true}));
// app.use(cors({origin:"http://localhost:3000",credentials:true}));
app.set('trust proxy', 1)
app.use(
  cookieSession({
    signed:false,
    secure:true,
    sameSite:'none'
  })
)
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
dotenv.config();

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port:process.env.DB_PORT,
    dialect:process.env.DB_DIALECT,
    // dialect: 'mariadb'
  });
  const connectdb = async() =>{
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
        } catch (error) {
        console.error('Unable to connect to the database:', error);
        }
    }  
  connectdb();

app.use("/",login);

app.listen(process.env.PORT || 80,()=>{console.log(`
=======================>Listening on port number 5000`)})