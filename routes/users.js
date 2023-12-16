var express = require('express');
var router = express.Router();
const cotrol = require('../controller/user-control');
const {Validate} = require('../middleware/validationResult.js');
const {verifUser}=require('../middleware/verify.js');
const {verifyAdmin}=require('../middleware/verify.js');
const {moo}=require('../middleware/validationResult.js');
////////signup
router.post('/signup',Validate,cotrol.singup) //done
/////////login
router.get('/signin', Validate,cotrol.singin); //done
////// delete 
router.delete("/deleteuser/:id", cotrol.deleteByID); //done

router.get('/logout', cotrol.logout);

router.route("/profilusers").get(verifyAdmin,cotrol.getAllusers);

router.route("/profile/:id")
.get(cotrol.getByID)
.put( cotrol.updateByID);

router.get("/count",cotrol.getUsersCount);
module.exports = router;
