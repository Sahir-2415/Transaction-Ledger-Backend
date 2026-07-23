const {Router}=require('express');
const authMiddleware=require('../middlewares/auth.middleware')
const transactionController=require('../controllers/transaction.controller');
const transactionRoutes=Router();

transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction);// before any transaction , check if the token is valid or not using middleware

/* 
    POST /api/transactions/system/initial-funds
    Create initial funds transaction from system user
*/

transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction);


module.exports=transactionRoutes