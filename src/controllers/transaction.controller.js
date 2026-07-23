const transactionModel=require('../models/transaction.model');
const ledgerModel=require('../models/ledger.model');
const emailService=require('../services/email.service');
const accountModel=require('../models/account.model');
const mongoose=require('mongoose');

// 2 steps to a complete transaction -> first a transaction is created then to reinforce it , a ledger entry is created


/* 
 * -CREATE A NEW TRANSACTION
    *-THE 10 STEP TRANSFER FLOW
        -Validate Request 
        -Validate Idempotency Key
        -Check account status
        -Derive sender balance from ledger
        -Create transaction (Pending)
        -Create Debit ledger entry
        -Create Credit Ledger entry
        -Mark transaction Completed
        -Commit MongoDB session
        -Send email notification
*/

async function createTransaction(req,res){

    // 1.VALIDATE REQUEST

    const {fromAccount,toAccount,amount,idempotencyKey}=req.body;


    if(!fromAccount || !toAccount || !amount || !idempotencyKey){ // check if any not given by the user
        return res.status(400).json({ // 400 means error on client side by the user
            message:"fromAccount, toAccount, amount, idempotencyKey are required"
        })
    } 

    //Now we also need to check whether the fromAccount and toAccount exist or not and for that we are going to use accountModel

    const fromUserAccount=await accountModel.findOne({
        _id:fromAccount
    })

    const toUserAccount=await accountModel.findOne({
        _id:toAccount
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount"
        })
    }

    /* 
        2.VALIDATE IDEMPOTENCY KEY
    */

    const isTransactionAlreadyExists=await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    })


    if(isTransactionAlreadyExists){

        if(isTransactionAlreadyExists.status==='COMPLETED'){
            res.status(200).json({
                message:"Transaction already completed",
                transaction:isTransactionAlreadyExists
            })

        }

        if(isTransactionAlreadyExists.status==='PENDING'){
            return res.status(200).json({
                message:"Transaction is still processing"
            })
        }

        if(isTransactionAlreadyExists.status==='FAILED'){
            return res.status(500).json({
                message:"Transaction processing failed , Please retry"
            })
        }
            
        if(isTransactionAlreadyExists.status==='REVERSED'){
            return res.status(500).json({
                message:"Transaction was reversed , Please retry"
            })
        }
        
    }

    /* 
        3.CHECK ACCOUNT STATUS
    */

    if(fromUserAccount.status!=='ACTIVE' || toUserAccount.status!=="ACTIVE"){
        return res.status(400).json({
            message:"Both fromAccount and toAccount must be ACTIVE to process the transaction"
        })
    }

    /* 4.DERIVE SENDER BALANCE FROM LEDGER */

     const balanceData=await fromUserAccount.getBalance();
     if(balanceData<amount){
        return res.status(400).json({
            message:`Insufficient balance.Current balance is ${balanceData}. Requested balance is ${amount}` 
        })
     } 

    /* 
        5.Create transaction (PENDING)
     */
    let transaction;
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        

        [transaction] = await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status:"PENDING"
        }],{session});

        await ledgerModel.create([{
            account:fromAccount,
            amount:amount,
            transaction:transaction._id,
            type:"DEBIT"
        }],{session})

        await ledgerModel.create([{
            account:toAccount,
            amount:amount,
            transaction:transaction._id,
            type:"CREDIT"
        }],{session})

        transaction.status="COMPLETED"
        await transaction.save({session})

        await session.commitTransaction();
        session.endSession();


    }catch(err){
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })
    }
     


    /* 
        Send Email Notification
    */
     try{
        await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);
    }catch(emailErr){
        console.error("Failed to send transaction email:", emailErr);
    }
 
    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    });
}


async function createInitialFundsTransaction(req,res){
    const {toAccount,amount,idempotencyKey}=req.body;

    // check if all the values are coming or not
    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount,amount and idempotencyKey are required"
        })
    }

    // find whether an account exists with the id provided to us in req

    const toUserAccount=await accountModel.findOne({
        _id:toAccount
    })

    if(!toUserAccount){
        return res.status(400).json({
            message:"Invalid toAccount"
        })
    }

    const fromUserAccount=await accountModel.findOne({
        systemUser:true,
        user:req.user._id
    })
    //if frontend engineer by mistakely deletes database , therefore we need to have this check as well
    if(!fromUserAccount){
        return res.status(400).json({
            message:"System user account not found"
        })
    }

    let transaction;
    //start the transaction session now
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
            [transaction]=await transactionModel.create([{
            fromAccount:fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status:"PENDING"
        }],{session})

        await ledgerModel.create({
            account:fromUserAccount._id,
            amount:amount,
            transaction:transaction._id,
            type:"DEBIT"
        },{session})
        await ledgerModel.create({
            account:toUserAccount._id,
            amount:amount,
            transaction:transaction._id,
            type:"CREDIT"
        },{session})

        transaction.status="COMPLETED"
        await transaction.save({session})

        await session.commitTransaction();
        session.endSession();
    }catch(err){
        await session.abortTransaction();
        session.endSession();
 
        return res.status(400).json({
            message: "Transaction failed due to some issue, please retry after sometime"
        });
    }
    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    });

}

module.exports={
    createTransaction,createInitialFundsTransaction
}