var express = require('express');
var router = express.Router();
const verify = require('../middleware/verify.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).json({
    message : 'it is working '
  }) 
});




module.exports = router;
