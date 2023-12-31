var express = require('express');
var router = express.Router();
const cotrol = require('../controller/user-control');
const {Validate} = require('../middleware/validationResult.js');
const {verifUser, verifyEmployee}=require('../middleware/verifytoken.js');
const {verifyAdmin}=require('../middleware/verifytoken.js');
const {moo}=require('../middleware/validationResult.js');

////////signup
router.post('/signup',Validate,cotrol.singup) //done
/////////login
router.post('/signin', Validate,cotrol.singin ); //done


//view user profile for Admin
router.route("/profilusers").get( verifyAdmin,cotrol.getAllUsers); //done
////// delete for Admin
router.delete("/deleteuser/:id",verifyAdmin, cotrol.deleteByID); //done
///for Admin
router.post("/addEmployee",verifyAdmin,cotrol.addEmployee);
//edit profile for user
router.route("/profile")
.put(verifUser, cotrol.updateByID);

router.get("/image",verifyEmployee,cotrol.getImage);
//عدد اليوزر بالداتا بيس 
router.get("/count",cotrol.getUsersCount);

module.exports = router;
