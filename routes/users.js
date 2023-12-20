var express = require('express');
var router = express.Router();
const cotrol = require('../controller/user-control');
const {Validate} = require('../middleware/validationResult.js');
const {verifUser}=require('../middleware/verify.js');
const {verifyAdmin}=require('../middleware/verify.js');
const{verifyEmployee}=require('../middleware/verify.js');
const {moo}=require('../middleware/validationResult.js');
////////signup
router.post('/signup',Validate,cotrol.singup) //done
/////////login
router.get('/signin', Validate,cotrol.singin); //done


//view user profile for Admin
router.route("/profilusers").get(cotrol.getAllUsers); //done
////// delete for Admin
router.delete("/deleteuser/:id", cotrol.deleteByID); //done
///for Admin
router.post("/addEmployee",cotrol.addEmployee);

//logout
router.get('/logout', cotrol.logout);


//edit profile for user
router.route("/profile/:id")
.get(cotrol.getByID)
.put( cotrol.updateByID);





//عدد اليوزر بالداتا بيس 
router.get("/count",cotrol.getUsersCount);


module.exports = router;
