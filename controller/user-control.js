const User = require('../models/users');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Blacklist = require('../models/blacklist');
const { uploadImage } = require('../utils/cloudinary');
const { validationResult } = require('express-validator');

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
  }
});



singup = function (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    User.findOne({ userName: req.body.username })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({
                    message: 'This user already exists'
                });
            }

            upload.single('myfile')(req, res, (err) => {
                if (err) {
                    return res.status(400).json({
                        message: 'File upload error',
                        error: err.message
                    });
                }

                const imagepath = req.file ? req.file.path : null;
                const resultPromise = uploadImage(imagepath);

                resultPromise
                    .then(result => {

                        const user = new User({
                            image: result.secure_url,
                            userName: req.body.username,
                            password: req.body.password,
                            email: req.body.email,
                        });

                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(200).json({
                                    message: 'User created'
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: 'Error creating user',
                                    error: err.message
                                });
                            });
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).json({
                            message: 'Error uploading image',
                            error: error.message
                        });
                    });
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Error checking existing user',
                error: err.message
            });
        });
};

signin = async function (req, res, next) {
  // Get variables for the login process
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({
        status: "failed",
        data: [],
        message: "Account does not exist",
      });
   
    console.log("Password from request:", req.body.password);
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);   
      if (!isPasswordValid) {
        console.error("Invalid password");
        return res.status(401).json({
           status: "failed",
           data: [],
           message: "Invalid email or password. Please try again with the correct credentials.",
        });
     }
    const token = user.generateAccessJWT(); // generate session token for user
    res.cookie('access_token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 20 * 60 * 1000), 
    });
    res.status(200).json({
      status: "success",
      token:  token,
      role:user?.isAdmin?"admin":user.role,
      
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

logout = async function (req, res) {
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
  if (!user) {
    return res.status(404).json({ message: 'user not found' });
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

getAllUsers = async function (req, res, next) {
  try {
    const users = await User.find(
      {
        role: { $in: ['user', 'employee'] }
      }
    )
      .select('_id image userName role email');

    const response = {
      doc: users.map(user => {
        return {
          image: user.image,
          _id: user._id,
          userName: user.userName,
          role: user.role,
          email: user.email,
        };
      }),
    };

    res.status(200).json({
      users: response
    });
  } catch (err) {
    console.error('Error Retrieving Users:', err);

    res.status(404).json({
      message: err
    });
  }
};


updateByID = async function (req, res) {
  try {
    upload.single('myfile')(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          message: 'File upload error',
          error: err.message
        });
      }

      const { username, password, email } = req.body;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        req.body.password = hashedPassword;
      }

      const resultPromise = uploadImage(req.file.path); 

      resultPromise
        .then(async result => {
          const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
              $set: {
                username,
                password: req.body.password,
                email,
                image: result.secure_url
              }
            },
            { new: true }
          ).select("-password");

          if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
          }

          res.status(200).json(updatedUser);
        })
        .catch(error => {
          console.error(error);
          res.status(500).json({
            message: 'Error uploading image to Cloudinary',
            error: error.message
          });
        });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


addEmployee = function (req, res) {
  const { username, password, email } = req.body;
console.log("formData", username, password, email);

  User.find({ email: req.body.email }).then(result => {
    if (result.length < 1) {
        const user = new User({
          userName: req.body.username,
          email: req.body.email,
          password: req.body.password, 
          role: 'employee',
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
};

getUsersCount = async function (req, res) {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


getImage = function (req, res) {
  if(req.user.id){
    console.log("found")
  }
User.find({ _id: req.user.id})
  .select(' image')
  .then(doc => {
    const response = {
      doc: doc.map(doc => {
        return {
          image: doc.image,
        }
      })
    }
    res.status(200).json({
      user: response
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error"
    });
  });
}


module.exports = {
  singup,
  singin: signin,
  deleteByID: deleteByID,
  getByID: getByID,
  logout,
  getAllUsers,
  updateByID,
  getUsersCount,
  addEmployee,
  getImage,


}