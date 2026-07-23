const userModel=require('../models/user.model');
const jwt=require('jsonwebtoken');
const emailService=require('../services/email.service');

// User register controller -> POST /api/auth.register
async function userRegisterController(req,res){
    const {email,password,name}=req.body

    const isExists=await userModel.findOne({
        email:email
    })
    if(isExists){
        return res.status(422).json({
            message:"User already exists with email",
            status:"Failed"
        })
    }

    //create a user if user does not exist pehle se
    const user=await userModel.create({
        email,password,name
    })
    //create a token for the user
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY, {expiresIn:"3d"}) // expires in 3 days

    res.cookie("token",token); // save the token in cookies

     try{
        await emailService.sendRegistrationEmail(user.email,user.name);
        console.log('Email sent')
    }catch(err){
        console.log('Email not sent'+err);
    }
    return res.status(201).json({ // 201 sent when we create a resource on user request
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        message:"User created successfully",
        token
    })
    
}

async function userLoginController(req,res){
    const {email,password}=req.body;
    const user = await userModel.findOne({
        email
    }).select("+password"); // data and hash argument required error was coming here bcz we did select=false so this.password was coming undefined so we have to use this

    if(!user){
        return res.status(401).json({
            message:"Email or password is Invalid"
        })
    }

    const isValidUser=await user.comparePassword(password);
    if(!isValidUser){
        return res.status(401).json({
            message:"Email or password is invalid"
        })
    }

    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"3d"});

    res.cookie("token",token);

    return res.status(201).json({
        message:"User logged in successfully",
        user:{
            _id:user._id,
            email:user.email,
            name:user.name,
        }
    })

}



module.exports={userRegisterController,userLoginController};