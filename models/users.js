const { default: mongoose } = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userSchema = mongoose.Schema({
    userName :{
        type :String , 
        required :true,
        max: 25,
    }
     ,
    password :{
        type:String ,
        required:true ,

    },
    email:{
        type:String,
        required:true,
        unique: true,
    },
    image:{
        type:String,
    },
      isAdmin :{
        type:Boolean,
        default:false ,
      },
      bio: String,
      role: {
        type: String,
        enum: ['user', 'employee'],
        default: 'user',
    },
})
userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) return next(err);

          user.password = hash;
          next();
      });
  });
});

userSchema.methods.generateAccessJWT = function () {
    let payload = {
      id: this._id,
     isAdmin :this.isAdmin,
    };
    return jwt.sign(payload,process.env.SECRET_ACCESS_TOKEN, {
      expiresIn: '40m',
    });

  };
  
module.exports = mongoose.model('user',userSchema);