const jwt = require('jsonwebtoken');
require('dotenv').config();


function Verify(req, res, next) {
  const authHeader = req.headers.cookie; 

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log("Token:", token);
    try {
        const decodedPayLoad = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        console.log("Decoded Payload:", decodedPayLoad);

      req.user = decodedPayLoad;
      next();
    } catch (error) {
      console.error("Token Verification Error:", error);
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
        if(req.user.role === "employee"){
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
        if(req.user.id === req.params.id){
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