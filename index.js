import express from 'express';
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config() 
import { UserRouter } from './componets/route.js';

const app=express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors(
    {
        origin:["https://client-login-and-signup.vercel.app"],
        credentials:true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }
))
app.use(cookieParser())
app.use('/auth',UserRouter)

mongoose.connect("mongodb://localhost:27017/authentication")

app.listen(process.env.PORT,()=>{
    console.log('Server is running')
})