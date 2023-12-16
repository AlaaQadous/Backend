var express = require('express');
var router = express.Router();
const cotrol = require('../controller/transaction-controller');


router.post('/addTran',cotrol.addTran) //done







module.exports = router;
