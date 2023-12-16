const User = require('../models/users');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Blacklist = require('../models/blacklist');
const filefilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpeg') {
      cb(null, true)
  }
  else {
      cb(new Error('please upload jpeg file'), false)
  }
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './userImage/');
  },
  filename: function (req, file, cb) {
      cb(null, new Date().toDateString() + file.originalname);
  },

});

const upload = multer({
  storage: storage,
  limits: {
      fileSize: 1024 * 1024 * 5
  },
  fileFilter: filefilter,
});

singup = function (req, res, next) {
  // Check if the user already exists
  User.find({ userName: req.body.username }).then(result => {
    if (result.length < 1) {
      upload.single('myfile')(req, res, (err) => {
        if (err) {
          return res.status(404).json({
            message: err.message
          });
        }
        const user = new User({
          userName: req.body.username,
          password: req.body.password, // Store plaintext password
          email: req.body.email,
          image: req.file.path,
        });
        user.save().then(result => {
          console.log(result);
          res.status(200).json({
            message: 'User created'
          });
        }).catch(err => {
          res.status(404).json({
            message: err.message
          });
        });
      });
    } else {
      res.status(404).json({
        message: "This user already exists"
      });
    }
  }).catch(err => {
    res.status(404).json({
      message: err.message
    });
  });
}

signin = async function (req, res, next) {
  // Get variables for the login process
  const { email } = req.body;
  try {
      // Check if user exists
      const user = await User.findOne({ email }).select("+password");
      if (!user)
          return res.status(401).json({
              status: "failed",
              data: [],
              message: "Account does not exist",
          });
      // if user exists
      // validate password
      const isPasswordValid = bcrypt.compare(
          `${req.body.password}`,
          user.password
      );
      // if not valid, return unathorized response
      if (!isPasswordValid)
          return res.status(401).json({
              status: "failed",
              data: [],
              message:
                  "Invalid email or password. Please try again with the correct credentials.",
          });

      const token = user.generateAccessJWT(); // generate session token for user
      res.cookie('access_token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 20 * 60 * 1000), // Set the expiration time in milliseconds
      });
      res.status(200).json({
          status: "success",
          message: "You have successfully logged in."  +token,
      });
  } catch (err) {
      res.status(500).json({
          status: "error",
          code: 500,
          data: [],
          message: "Internal Server Error",
      });
  }
  res.end();
};

logout= async function (req, res) {
  try {
    const authHeader = req.headers['cookie']; // get the session cookie from request header
    if (!authHeader) return res.sendStatus(204); // No content
    const cookie = authHeader.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
    const accessToken = cookie.split(';')[0];
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
    // if true, send a no content response.
    if (checkIfBlacklisted) return res.sendStatus(204);
    // otherwise blacklist token
    const newBlacklist = new Blacklist({
      token: accessToken,
    });
    await newBlacklist.save();
    // Also clear request cookie on client
    res.setHeader('Clear-Site-Data', '"cookies"');
    res.status(200).json({ message: 'You are logged out!' });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
  res.end();
}

getByID = async function (req, res, next) {
 const user = await User.findById(req.params.id).select("-password");
 if(!user){
  return res.status(404).json({message:'user not found'});
 }
 res.status(200).json(user);
};

deleteByID = function (req, res, next) {
  User.findOneAndDelete({ _id: req.params.id }).
    then(result => {
      if (result) {
        console.log(result)
        return res.status(200).json({
          message: "user delete"
        })
      }
      else {
        return res.status(404).json({
          message: "user not found"
        })
      }
    }).
    catch(err => {
      return res.status(404).json({
        message: err
      })
    })
};


getAllusers = async function (req, res, next) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

updateByID = async function (req, res) {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          userName: req.body.username,
          password: req.body.password,
          bio: req.body.bio,
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


getUsersCount = async function(req, res) {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

 
module.exports = {
  singup,
  singin: signin,
  deleteByID: deleteByID,
  getByID: getByID,
  logout,
  getAllusers,
  updateByID,
 getUsersCount,
  

}