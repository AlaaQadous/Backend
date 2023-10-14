var express = require('express');
var router = express.Router();
const cotrol = require('../controller/order-controller')

/////////////////addorder
router.post('/addOrder',cotrol.addOrder) //done
///Get all order from database 
router.get('/',cotrol.getAll); //done
//////////يرحعلي حسب الid
router.get('/:orderID', cotrol.getallbyID); //done 
//////////update  
router.patch("/:orderId", cotrol.updateOrder); //done
/////////delete 
router.delete('/:orderId', cotrol.deleteOrder); //done





module.exports = router;

