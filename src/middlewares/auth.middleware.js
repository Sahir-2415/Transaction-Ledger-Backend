const userModel=require('../models/user.model');
const jwt=require('jsonwebtoken');
const blackListModel=require('../models/blackList.model');
// FLOW FOR MIDDLEWARE IS - VERIFY TOKEN , DECODE USER , ATTACH USER

async function authMiddleware(req,res,next){
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message:"Unauthorized access,token is missing"
        })
    }

    const isBlackListed=await blackListModel.findOne({token});
    if(isBlackListed){
        return res.status(401).json({
            message:"The token is blackListed"
        })
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY); // verify the token
        const user= await userModel.findById(decoded.userId); // jis bhi user ki detail nikalti hai db se
        req.user=user; // user req.user mai set karo
        return next();
    }catch(err){
        return res.status(401).json({
            message:"Unauthorized access,token is invaliddd",
            errore:err
        })
    }
}   

async function authSystemUserMiddleware(req,res,next){
    const token=req.headers.authorization?.split(" ")[1] || req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token is missing"
        })
    }

    const isBlackListed=await blackListModel.findOne({token});
    if(isBlackListed){
        return res.status(401).json({
            message:"Unauthorized access , token is invalid"
        })
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
        const user=await userModel.findById(decoded.userId).select("+systemUser");

        if(!user.systemUser){
            return res.status(403).json({
                message:"Forbidden access, not a system user"
            })
        }
        req.user=user;

        return next();

    }catch(err){
        return res.status(401).json({
            message:"Unauthorized access, token is invalid",
            error:err
        })
    }

}

module.exports={
    authMiddleware,authSystemUserMiddleware
}