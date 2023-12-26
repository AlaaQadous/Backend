const { default: mongoose } = require('mongoose');
const mongoos = require('mongoose');

const orderSchema = mongoos.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
     }, 
    state:{
        type:String,
        enum:['New','InProgress','Ready'],
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
         default: () => new Date().toISOString().split('T')[0], 
    get: (val) => val ? val.toISOString().split('T')[0]:null,
    }, 
    comment: {
        type: String,
      },
      price: {
        type: Number,
      },
      DeliveryDate : {
        type: Date,
      },
 

})
module.exports = mongoose.model('order',orderSchema);