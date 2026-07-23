const mongoose=require('mongoose');

/* 
    TRANSACTION IS DEFINED AS - 
        -> REQUIRES A FROM ACCOUNT (from where money is sent ) AND A TO ACCOUNT(where money is sent) , requires a status and an Idempotency Key 
*/

const transactionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.Object,
        ref:"account",
        required:[true,"Transaction must be associated with an account"],
        index:true // if we ever have to find all the transactions of an account , index makes it easier
    },
    toAccount:{
        type:mongoose.Schema.Types.Object,
        ref:"account",
        required:[true,"Transaction must be associated with an account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"Status can be either PENDING , COMPLETED , FAILED OR REVERSED"
        },
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a transaction"],
        min:[0,"Transaction amount can not be negative"]
    },
    idempotencyKey:{ // it is used to ensure that a certain action is not done twice due to some delay like slow internet
        type:String,
        required:[true,"Idempotency key is required for creating a transaction"],
        index:true,
        unique:true
    }
},{
    timestamps:true
})

const transactionModel=mongoose.model("transaction",transactionSchema);

module.exports=transactionModel;