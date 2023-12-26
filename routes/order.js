var express = require('express');
var router = express.Router();
const control = require('../controller/order-controller')
const {moo}=require('../middleware/validationResult.js');
const {verifUser}=require('../middleware/verifytoken.js');
const {verifyAdmin}=require('../middleware/verifytoken.js');
const{verifyEmployee}=require('../middleware/verifytoken.js');



/////////////////addorder for customer
router.post('/addOrder', verifUser,control.addOrder) //done
//////////يرحعلي حسب الid for customer
router.get('/:orderID',  verifUser,control.getallbyID); //done 



router.get('/getReady',  verifyAdmin,control.getReady); //for admin

///Get all order from database if state is New  for admin
router.get('/', verifyAdmin, control.getAll); //done

//////////confirmed  for Admin
router.patch("/:orderId", verifyAdmin, control.updateOrder); //done
/////////delete for admin 
router.delete('/:orderId',  verifyAdmin,control.deleteOrder); //done

///add informaion by employee
router.patch("/info/:orderID", verifyEmployee,control.updateinfo);//done

router.get('/getOrderEmpl', verifyEmployee,control.getOrderEmpl); // for employee if new & confirm
router.get('/getStates', verifyEmployee,control.getOr); //for employee if inProcess or Ready

module.exports = router;
