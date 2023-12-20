var express = require('express');
var router = express.Router();
const control = require('../controller/order-controller')
const {verifUser}=require('../middleware/verify.js');
const {verifyAdmin}=require('../middleware/verify.js');
const{verifyEmployee}=require('../middleware/verify.js');
const {moo}=require('../middleware/validationResult.js');

/////////////////addorder for customer
router.post('/addOrder',control.addOrder) //done
//////////يرحعلي حسب الid for customer
router.get('/:orderID', control.getallbyID); //done 

router.get('/getStates',control.getOr); //for employee
router.get('/getOrderEmpl',control.getOrderEmpl); // for employee

router.get('/getReady', control.getReady); //for admin

///Get all order from database if state is New  for admin
router.get('/',control.getAll); //done

//////////confirmed  for Admin
router.patch("/:orderId", control.updateOrder); //done
/////////delete for admin 
router.delete('/:orderId', control.deleteOrder); //done
/////////get all if Ready for Admin

///add informaion by employee
router.patch("/info/:orderID",control.updateinfo);//done

module.exports = router;
