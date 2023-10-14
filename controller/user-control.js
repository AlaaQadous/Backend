const User = require('../models/users');
const bcrypt = require('bcrypt');
const multer = require('multer');

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
  // أتأكد إذا كان المستخدم موجودًا من قبل أم لا
  User.find({ userName: req.body.username }).then(result => {
    if (result.length < 1) {
      upload.single('myfile')(req, res, (err) => {
        if (err) {
          return res.status(404).json({
            message: err.message
          });
        }
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(404).json({
              message: err.message
            });
          }

          const user = new User({
            userName: req.body.username,
            password: hash,
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
signin = function (req, res, next) {
  User.findOne({ userName: req.body.username })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'Wrong username' });
      }
      return bcrypt.compare(req.body.password, user.password)
        .then(result => {
          if (result) {
            return res.status(200).json({ message: 'Success signin' });
          } else {
            return res.status(404).json({ message: 'Password not matched' });
          }
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
}

updateByID = async function (req, res, next) {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const newuser = {
      userName: req.body.username,
      password: hash,
    };

    const result = await User.findOneAndUpdate({ _id: req.params.id }, { $set: newuser }, { new: true });

    if (result) {
      console.log(result);
      return res.status(202).json({
        message: "User updated successfully",
      });
    } else {
      return res.status(404).json({
        message: "User not found",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
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


module.exports = {
  singup: singup,
  singin: signin,
  deleteByID: deleteByID,
  updateByID: updateByID,

}