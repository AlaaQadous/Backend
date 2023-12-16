const { validationResult } = require("express-validator");
const {  mongoose } = require('mongoose');

const Validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let error = {};
        errors.array().map((err) => (error[err.param] = err.msg));
        return res.status(422).json({ error });
    }
    next();
};

const moo = (req,res,next)=>{
    if(!mongoose.Types.ObjectId.isValid(req.param.id)){
        return res.status(400).json({ message :"invalid id"});
    }
    next();
}

module.exports = {
    Validate,
    moo,
}

