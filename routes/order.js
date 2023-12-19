var express = require('express');
var router = express.Router();
const cotrol = require('../controller/order-controller')

/////////////////addorder for customer
router.post('/addOrder',cotrol.addOrder) //done
//////////يرحعلي حسب الid for customer
router.get('/:orderID', cotrol.getallbyID); //done 


///Get all order from database if state is New  for admin
router.get('/',cotrol.getAll); //done
//////////confirmed  for Admin
router.patch("/:orderId", cotrol.updateOrder); //done
/////////delete for admin 
router.delete('/:orderId', cotrol.deleteOrder); //done
/////////get all if Ready for Admin
router.get("/getReady",cotrol.getReady);


///add informaion by employee
router.patch("/info/:orderID",cotrol.updateinfo);//done


module.exports = router;

