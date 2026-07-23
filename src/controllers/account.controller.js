const accountModel=require('../models/account.model');

//account creation for a user based on userid
async function createAccountController(req,res){
    const user = req.user;

    const account=await accountModel.create({
        user:user._id
    })

    return res.status(201).json({
        account // acc created and sent in response
    })
}

async function getAccountController(req,res){
    const accounts=await accountModel.findMany({
        user:req.user._id
    })
    return res.status(200).json({
        message:accounts
    })
}

async function getAccountBalanceController(req,res){
    try{
        const {accountId}=req.params;
        const account=await accountModel.findOne({
            _id:accountId,
            user:req.user._id
        })
        if(!account){
            return res.status(404).json({
                message:"No account with this ID exists"
            })
        }
        const balance=await accountModel.getBalance();
        return res.status(200).json({
            message:"Account Balance returned successfully",
            balance:balance
        })
    }catch(err){
        return res.status(500).json({
            message:"Invalid",
            err
        })
    }
}

module.exports={createAccountController,getAccountController,getAccountBalanceController}