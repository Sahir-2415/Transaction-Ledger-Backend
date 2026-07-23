const express=require('express');
const  authMiddleware  = require('../middlewares/auth.middleware');
const accountController=require('../controllers/account.controller');
const router=express.Router();

router.post('/',authMiddleware.authMiddleware,accountController.createAccountController);
router.post('/',authMiddleware.authMiddleware,accountController.getAccountController);
//to get the account balance , pass the account id as the params
router.post('/balance/:accountId',authMiddleware.authMiddleware,accountController.getAccountBalanceController)

module.exports=router;