const { default: mongoose } = require('mongoose');
const mongoos = require('mongoose');
const newsSchema = mongoos.Schema({ 
  
image :{
    type : String ,
} ,
description :{
    type:String ,
},
date: {
    type: Date,
    default: Date.now ,
},
visible:{
    type:Boolean ,
    default : false,
}
});
module.exports = mongoose.model('new',newsSchema);