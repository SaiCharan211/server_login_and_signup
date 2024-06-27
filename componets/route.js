import express from 'express'
import bcryt from 'bcrypt'
import UserModel from '../componets/model.js'

const router =express.Router()
import jwt from "jsonwebtoken"
import nodemailer  from 'nodemailer'

router.post('/',async (req,res)=>{
    const {username,email,password}=req.body;
    const user=await UserModel.findOne({email})
    if(user){
        return res.json({status:false, message:"user already existed"})
    }
    const hashpassword =await bcryt.hash(password,10)
    if(username==="" || email==="" || password ===""){
      return res.json({status:false, message:"please fill all the fields"})
      
      
    }else{
      const newUser =new UserModel({ 
        username,
        email,
        password:hashpassword,
      })
      await newUser.save()
      return res.json({status:true,message:"record registed"})
      
     
    }
       
})

//Login

router.post('/login',async (req,res)=>{
    const {email,password}=req.body;
    const user=await UserModel.findOne({email})
    if(email!=='' && password!==''){
      if(!user){
        return res.json({message: "user is not registered",status:false})
    }
    const validpassword=await bcryt.compare(password,user.password)
    
    if(!validpassword){
        return res.json({message: "password is incorrect"})
    }
    const token=jwt.sign({username:user.username}, process.env.KEY, {expiresIn: "5m"})
    //console.log(token)
    res.cookie('token',token,{httpOnly:true, maxAge:2592000000})
    return res.json({status: true, message:"login successfull"})
    }else{
      return res.json({status:false, message:"please fill all the fields"})
    }

})


//Forgot Password
router.post('/forgot-password',async(req,res)=>{
  const {email}=req.body;
  try{
      const user=await UserModel.findOne({email})
     if(!user){
      return res.json({message:"user not registered"})
     }
     const token=jwt.sign({id:user._id},process.env.KEY,{expiresIn: "5m"})
     
     var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'saicharan9071@gmail.com',
        pass: 'wrch oakj fqmg hcfp'
      }
    });
    //const encodedToken=encodeURIComponent(token).replace(/\./g,"%2E")
    
    var mailOptions = {
      from: 'saicharan9071@gmail.com',
      to:email,
      subject: 'Reset Password',
      text:`https://client-login-and-signup.onrender.com/reset-password`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        return res.json({message:"error sending mail",error:error})
      } else {
        console.log('Email sent:'+info.response)
        return res.json({status:true,message:"email sent"})
      }
    });

  }catch(err){
    console.log(err)
  }
})

//Reset Password
router.post('/reset-password/:token',async (req,res)=>{
  const {token}=req.params;
  const {password}=req.body;
  
  try{
    const decoded=await jwt.verify(token,process.env.KEY)
    const id=decoded.id

    const hashPassword=await bcryt.hash(password, 10)
   const newUserdata= await UserModel.findByIdAndUpdate(id,{password:hashPassword})
    
    return res.json({status:true, message: `updated password : ${password}, user:${newUserdata}`})
    
  }catch(err){
     return res.json(err)
  }
})


//Verify Home
const verifyUser=async (req,res,next)=>{
  try{
  const token=req.cookies.token;
  if(!token){
    return res.json({status:false, message:"no token"})
  }
  const decoded=await jwt.verify(token, process.env.KEY)
  next()

  } catch(err){
    return res.json(err)
  }
} 

router.get('/verify',verifyUser, (req,res)=>{
  return res.json({status:true, message:'authorized'})
})

router.get('/logout',(req,res)=>{
  res.clearCookie('token')
    return res.json({status:true})
  
})



//get

router.get('/',async(req,res)=>{
  try{
    const data=await UserModel.find()
    res.json(data)
  }catch(err){
    res.send(err)
  }
})

router.get('/login',(req,res)=>{
  res.send("login")
})


export {router as UserRouter}