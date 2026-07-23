const mongoose=require('mongoose');

const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Ledger must be associated with an account"],
        index:true, // inorder to find all the credits and debits of an account,
        immutable:true // so that we can not delete any credit or debit
    },
    ammount:{
        type:Number,
        required:[true,"Amount is required for creating a Ledger Entry"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Ledger must be associated with a transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Type can be either be credit or debit"
        },
        required:[true,"Ledger type is required"],
        immutable:true
    }
})

/* LEDGER SHOULD NOT BE MODIFIED AT ANY COST SO TO PREVENT THAT WE USE CERTAIN HOOKS */

function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and can not be deleted or modified");
}


/* If these are done by the person , the error should be called */
ledgerSchema.pre("findOneAndUpdate",preventLedgerModification); // this means if the person did findOneAndupdate - the function to throw error should be called
ledgerSchema.pre("updateOne",preventLedgerModification); 
ledgerSchema.pre("deleteOne",preventLedgerModification); 
ledgerSchema.pre("remove",preventLedgerModification); 
ledgerSchema.pre("deleteMany",preventLedgerModification); 
ledgerSchema.pre("updateMany",preventLedgerModification); 
ledgerSchema.pre("findOneAndDelete",preventLedgerModification); 
ledgerSchema.pre("findOneAndReplace",preventLedgerModification); 


const ledgerModel=mongoose.model("ledger",ledgerSchema);

module.exports=ledgerModel;