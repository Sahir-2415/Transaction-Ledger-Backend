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

module.exports={createAccountController}