import express from 'express';
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config() 
import { UserRouter } from './componets/route.js';

const app=express()
app.use(express.json())
const corsOptions = {
    origin: 'https://client-login-and-signup-a13o1lyvw.vercel.app/', // Replace with your frontend URL
    credentials: true, // Allow credentials
  };
  
  app.use(cors(corsOptions));
  
  // Add this to handle preflight requests
  app.options('*', cors(corsOptions));
app.use(cookieParser())
app.use('/',UserRouter)

//mongoose.connect("mongodb://localhost:27017/authentication")
mongoose.connect(process.env.MONGO_URL)

app.listen(process.env.PORT,()=>{
    console.log('Server is running')
})