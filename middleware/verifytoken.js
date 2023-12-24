const jwt = require('jsonwebtoken');
require('dotenv').config();


 async function Verify(req, res, next) {
  const authHeader = req.headers.token; 

  if (authHeader ) {
    const token = authHeader.split("__")[1];

    try {
        console.log("Token:", token);

        const decodedPayLoad = await jwt.verify(token,process.env.SECRET_ACCESS_TOKEN);
        console.log("Decoded Payload:", decodedPayLoad);

      req.user = decodedPayLoad;
      next();
    } catch (error) {
      console.error("Token Verification Error:", error.stack);
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
}



function verifyAdmin(req,res,next){
    Verify(req,res,()=>{
        if(req.user.isAdmin){
            next();
        }else{
            return res.status(403).json({
                message:"not allowed,only Admin"
            })
        }
    })
}




function verifyEmployee(req,res,next){
    Verify(req,res,()=>{
        if(req.user.role = "employee"){
            next();
        }else{
            return res.status(403).json({
                message:"Not Allowed,Only Employee"
            })
        }
    })
}
function verifUser(req,res,next){
    Verify(req,res,()=>{
        if(req.user.role = "user"){
            next();
        }else{
            return res.status(403).json({
                message:"not allowed,only User"
            })
        }
    })
}

module.exports ={
    Verify,
    verifyAdmin,
    verifUser,
    verifyEmployee,
}