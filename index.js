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
    origin: 'http://localhost:5173',
    credentials:true
}))
app.options('*', cors());
app.use(cookieParser())
app.use('/',UserRouter)

//mongoose.connect("mongodb://localhost:27017/authentication")
//mongoose.connect(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
app.listen(process.env.PORT,()=>{
    console.log('Server is running')
})