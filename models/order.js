const { default: mongoose } = require('mongoose');
const mongoos = require('mongoose');

const orderSchema = mongoos.Schema({
    price:{
        type:Number,   
    },
    date:{
        type:String,
    },
    state:{
        type:String,
        default: "New",
    },
    image:{
        type:String,
    },
    confirmed:{
        type:Boolean,
        default :false ,
    },
    material:{
     type:String,
    },
    size:{
        type:Number,
    },
    description:{
        type:String,
    },
    date: {
         type: Date,
         default: Date.now ,
    }, 


})
module.exports = mongoose.model('order',orderSchema);