const { default: mongoose } = require('mongoose');
const mongoos = require('mongoose');
const userSchema = mongoos.Schema({
    userName :{
        type :String , 
        required :true,
    } ,
    password :{
        type:String ,
        required:true 
    },
    email:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
})
module.exports = mongoose.model('user',userSchema);