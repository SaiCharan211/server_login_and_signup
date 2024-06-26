import express from 'express';
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config() 
import { UserRouter } from './componets/route.js';

const app=express()
app.use(express.json())
/* app.use(cors({
    origin: 'http://localhost:5173',
    credentials:true
}))
app.options('*', cors());
app.use(cookieParser())
app.use('/',UserRouter)
*/
const allowedOrigins = ["http://localhost:5173", "https://client-login-and-signup.vercel.app"];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors());
//mongoose.connect("mongodb://localhost:27017/authentication")
//mongoose.connect(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL)

app.listen(process.env.PORT,()=>{
    console.log('Server is running')
})