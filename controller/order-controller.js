const { getRounds } = require('bcrypt');
const Order = require('../models/order');
const multer = require('multer');
const { uploadImage } = require('../utils/cloudinary');
const { default: mongoose } = require('mongoose');
const mongoos = require('mongoose');

/////////////////addorder

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './orderImage/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toDateString() + file.originalname);
    },

});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2
    },
});


const addOrder = function (req, res, next) {
    upload.single('myfile')(req, res, (err) => {
        if (err) {
            console.log(err)
            return res.status(404).json({
                message: err.message
            });
        }

        const imagepath = req.file ? req.file.path : null;
        const resultPromise = uploadImage(imagepath);

        resultPromise
            .then(result => {
                const order = new Order({
                    description: req.body.description,
                    image: result.secure_url,
                    size: req.body.size,
                    lengthValue:req.body.lengthValue,
                    widthValue:req.body.widthValue,
                    material:req.body.material,
                    user: req.user.id,
                });
console.log(order)
                order.save()
                    .then(doc => {
                        res.status(200).json({
                            message: 'Order created successfully',
                            order: doc
                        });
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).json({
                            message: 'Internal Server Error',
                        });
                    });
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({
                    message: 'Error uploading image',
                });
            });
    });
};
//get all in database
getAll = function (req, res, next) {
    Order.find({
        state: 'New',
        confirmed : 'false' ,
    }
    ).
        select('_id description lengthValue widthValue image date material').
        then(doc => {
            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        size: doc.size,
                        image: doc.image,
                        _id: doc._id,
                        date:doc.date,
                        material:doc.material,
                        lengthValue :doc.lengthValue,
                        widthValue :doc.widthValue

                    }
                })
            }
            console.log(doc)
            res.status(200).json({
                order: response
            })
        }).
        catch(err => {
            res.status(404).json({
                message: err
            })
        })

};
//////getallbyID 
getallbyID = function (req, res, next) {
    Order.find({ _id: req.params.orderID })
    .select('_id description image date price DeliveryDate state comment ')
    .then(doc => {
        console.log('Retrieved Orders:', doc);

        const response = {
            doc: doc.map(doc => {
                return {
                    description: doc.description,
                    image: doc.image,
                    _id: doc._id,
                    date: doc.date,
                    DeliveryDate: doc.DeliveryDate,
                    price: doc.price,
                    state:doc.state,
                    comment:doc.comment, 
                }
            })
        }

        res.status(200).json({
            order: response
        });
    })
    .catch(err => {
        console.error('Error Retrieving Orders:', err);

        res.status(404).json({
            message: err
        });
    });
};
////deleteOrder 
deleteOrder = function (req, res, next) {
    Order.deleteOne({ _id: req.params.orderId })
        .then(result => {
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: 'Order deleted successfully',
                });
            } else {
                res.status(404).json({
                    message: 'Order not found',
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Internal Server Error',
                error: err,
            });
        });
};
///updateOrder ( confirmed true)
updateOrder = function (req, res, next) {
    const order = {
        confirmed : true ,
    };
    Order.findOneAndUpdate({ _id: req.params.orderId }, { $set: order }, { new: true }).
        then(result => {
            if (!result) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }
            res.status(200).json({
                message: "Order updated",
                updatedOrder: result
            });
        }).
        catch(err => {
            res.status(500).json({
                message: "Internal server error",
                error: err
            });
        });
};
const updateinfo = async function (req, res, next) {
    console.log('Received PATCH request to /info/:orderID with ID:', req.params.orderID);
    const { comment, price, DeliveryDate } = req.body; 
    console.log('Received data:', { comment, price, DeliveryDate });
    
    try {
        let employeeName = '';
        if (req.user.id) {
            const user = await mongoose.model('user').findById(req.user.id);
            if (user) {
                employeeName = user.userName; 
            }
        }

        const orderUpdates = {
            comment: req.body.comment || undefined,
            price: req.body.price || undefined,
            DeliveryDate: req.body.DeliveryDate || undefined,
            state: "InProgress",
            employeeName: employeeName,
        };

        const result = await Order.findOneAndUpdate({ _id: req.params.orderID }, { $set: orderUpdates }, { new: true });

        if (!result) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        console.log('MongoDB Update Result:', result);
        res.status(200).json({
            message: "Order updated",
            updatedOrder: result
        });
    } catch (error) {
        console.error('MongoDB Update Error:', error);
        res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
};
 
getReady = function (req, res,) {
    Order.find({ state: 'Ready' })
        .select('_id description image date price DeliveryDate user employeeName')
        .then(doc => {
            console.log('Retrieved Orders:', doc);
            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        image: doc.image,
                        _id: doc._id,
                        date: doc.date,
                        DeliveryDate: doc.DeliveryDate,
                        price: doc.price,
                        user: doc.user,
                        employeeName: doc.employeeName ,
                    }
                })
            }

            res.status(200).json({
                order: response
            });
        })
        .catch(err => {
            console.error('Error Retrieving Orders:', err);

            res.status(404).json({
                message: err
            });
        });
};

getOr = function (req, res, next) {

    Order.find({ 
        state: { $in: ['Ready', 'InProgress'] }
         })
        .populate('user', 'userName')
        .select('_id description image date price DeliveryDate user state ')
        .then(doc => {
            console.log('Retrieved Orders:', doc);

            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        image: doc.image,
                        _id: doc._id,
                        date: doc.date,
                        DeliveryDate: doc.DeliveryDate,
                        price: doc.price,
                        user: doc.user ? doc.user.userName : null,
                        state : doc.state ,
                    }
                })
            }

            res.status(200).json({
                order: response
            });
        })
        .catch(err => {
            console.error('Error Retrieving Orders:', err);

            res.status(404).json({
                message: err
            });
        });
    
};
getOrderEmpl = function (req, res, next) {
    console.log('Entering getOrderEmpl function');
         Order.find({ 
            state: 'New',
            confirmed : true,
        })
        .select('_id description image size material  ')
        .then(doc => {
            console.log('Retrieved Orders:', doc);
            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        image: doc.image,
                        _id: doc._id,
                        material: doc.material, 
                        size:doc.size,
                    }
                })
            }
            res.status(200).json({
                order: response
            });
        })
        .catch(err => {
            console.error('Error Retrieving Orders:', err);
            res.status(404).json({
                message: err
            });
        });
    
};
getAll1 = function (req, res, next) {
    Order.find({ 
        state: 'New',
        confirmed : true,
    }).
        select('_id description  widthValue  lengthValue image  material').
        then(doc => {
            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        lengthValue:doc.lengthValue,
                        widthValue:doc.widthValue,
                        image: doc.image,
                        _id: doc._id,
                        material:doc.material,
                    }
                })
            }
            res.status(200).json({
                order: response
            })
        }).
        catch(err => {
            res.status(404).json({
                message: err
            })
        })

};
getReady1 = function (req, res) {
    Order.find({ state: 'Ready' })
      .select('_id description image date employeeName price DeliveryDate user')
      .then((doc) => {
        console.log('Retrieved Orders:', doc);
        const response = {
          doc: doc.map((doc) => {
            return {
              description: doc.description,
              image: doc.image,
              _id: doc._id,
              date: doc.date,
              DeliveryDate: doc.DeliveryDate,
              price: doc.price,
              user: doc.user,
              employeeName: doc.employeeName ,
              
            };
          }),
        };
  
        res.status(200).json({
          order: response,
        });
      })
      .catch((err) => {
        console.error('Error Retrieving Orders:', err);
  
        res.status(404).json({
          message: err,
        });
      });
  };
  
getByIduser = function (req, res, next) {
    const userId = req.user.id; 
    Order.find({ user: userId }) 
        .select('_id description image date price DeliveryDate state comment')
        .then(orders => {
            if (orders.length === 0) {
                return res.status(404).json({ message: 'No orders found for the user' });
            }
            console.log('Retrieved Orders:', orders);

            const response = {
                orders: orders.map(order => ({
                    description: order.description,
                    image: order.image,
                    _id: order._id,
                    date: order.date,
                    DeliveryDate: order.DeliveryDate,
                    price: order.price,
                    state: order.state,
                    comment: order.comment,
                }))
            };

            res.status(200).json(response);
        })
        .catch(err => {
            console.error('Error Retrieving Orders:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
};
const updateReady = function (req, res, next) {
    const order = {
      state: 'Ready',
    };
  
    Order.findOneAndUpdate({ _id: req.params.orderId }, { $set: order }, { new: true })
      .then(result => {
        if (!result) {
          return res.status(404).json({
            message: "Order not found"
          });
        }
  
        return res.status(200).json({
          message: "Order updated",
          updatedOrder: result
        });
      })
      .catch(err => {
        return res.status(500).json({
          message: "Internal server error",
          error: err
        });
      });
  };
module.exports = {
    addOrder: addOrder,
    getAll: getAll,
    getallbyID: getallbyID,
    deleteOrder: deleteOrder,
    updateOrder: updateOrder,
    updateinfo,
    getReady,
    getOr,
    getOrderEmpl,
    getAll1,
    getReady1,
    getByIduser,
    updateReady
}