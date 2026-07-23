const mongoose=require('mongoose');
const ledgerModel=require('../models/ledger.model')

//AccountModel is used bcz a person can have one Identity(user) but multiple bank accounts ans saving everything ex - transactions , saving acc , bankacc , USD acc directly in user is messy
const accountSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId, // stores the id of the user document
        ref:"user",
        required:[true,"Account must be associated with a user"],
        index:true // this is to improve the speed of searching the user , B+ tree is used for searching
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"Status can be either ACTIVE, FROZEN OR CLOSED",
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        required:[true,"Currency is required for creating an account"],
        default:"INR"
    }
},{
    timestamps:true
})

//this is a compound index , ie. can search a user on the basis of user id and status , here 1 means - ascending index , -1 means descending index
accountSchema.index({user:1,status:1});

accountSchema.methods.getBalance = async function(){
    const balanceData=await ledgerModel.aggregate([
        {$match:{account:this._id}},
        {
            $group:{
                _id:null,
                totalDebit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type","DEBIT"]},
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type","CREDIT"]},
                            "$amount",
                            0 
                        ]
                    }
                }
            }
        },
        {
            $project:{
                _id:0,
                balance:{$subtact:["$totalCredit","$totalDebit"]}
            }
        }
    ])

    if(balanceData.length===0){
        return 0 
    }
    return balanceData[0].balance;
}

const accountModel=mongoose.model("account",accountSchema);

module.exports=accountModel;