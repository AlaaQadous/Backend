var express = require('express');
var router = express.Router();
const cotrol = require('../controller/user-control')

////////signup
router.post('/signup', cotrol.singup) //done
/////////login
router.get('/signin', cotrol.singin); //done
/////////update user 
router.patch('/update/:id', cotrol.updateByID); //done
////// delete 
router.delete("/deleteuser/:id", cotrol.deleteByID); //done





module.exports = router;
