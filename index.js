import express from 'express';
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config() 
import { UserRouter } from './componets/route.js';

const app=express()
app.use(express.json())

const corsOptions={
    origin:"http://localhost:5173/",
    credentials:true
}
app.use(cors(corsOptions))
//app.use(cors())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
app.options('*', cors(corsOptions)); // This will handle preflight requests.

app.use(cookieParser())
app.use('/',UserRouter)

//mongoose.connect("mongodb://localhost:27017/authentication")
mongoose.connect(process.env.MONGO_URL)

app.listen(process.env.PORT,()=>{
    console.log('Server is running')
})