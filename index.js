import express from 'express';
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config() 
import { UserRouter } from './componets/route.js';

const app=express()
app.use(express.json())

app.use(cors({
    origin: 'https://client-login-and-signup-kfeznr3cl.vercel.app/',
    credentials:true
}))
app.options('*', cors());
app.use(cookieParser())
app.use('/',UserRouter)




//mongoose.connect("mongodb://localhost:27017/authentication")
//mongoose.connect(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL)

app.listen(process.env.PORT,()=>{
    console.log('Server is running')
})