var express = require('express');
var router = express.Router();
const control = require('../controller/order-controller')
const {moo}=require('../middleware/validationResult.js');
const {verifUser}=require('../middleware/verifytoken.js');
const {verifyAdmin}=require('../middleware/verifytoken.js');
const{verifyEmployee}=require('../middleware/verifytoken.js');


router.get('/get', control.getReady1); //for admin


router.get('/1getOrderEmpl', verifyEmployee,control.getAll1); // for employee if new & confirm


/////////////////addorder for customer
router.post('/addOrder', verifUser,control.addOrder) //done
//////////يرحعلي حسب الid for customer
router.get('/get1',verifUser, control.getByIduser); //done 




///Get all order from database if state is New  for admin
router.get('/', verifyAdmin, control.getAll); //done

//Ready order 
router.patch("/orders/:orderId", verifUser, control.updateReady); //done

//////////confirmed  for Admin
router.patch("/:orderId", verifyAdmin, control.updateOrder); //done
/////////delete for admin 
router.delete('/:orderId',control.deleteOrder); //done

///add informaion by employee
router.put("/info/:orderID", verifyEmployee,control.updateinfo);//done

router.get('/getStates', verifyEmployee,control.getOr); //for employee if inProcess or Ready


module.exports = router;
