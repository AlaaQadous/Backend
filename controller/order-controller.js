const { getRounds } = require('bcrypt');
const Order = require('../models/order');
const multer = require('multer');

/////////////////addorder
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
        cb(null, './orderImage/');
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

const uploadMiddleware = upload.single('myfile');

const addOrder = function (req, res, next) {
    uploadMiddleware(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err.message });
        }
        console.log(req.file);
        const order = new Order({
            description: req.body.description,
            material: req.body.material,
            size: req.body.size,
            image: req.file.path,
            //user :req.user.id,
        });

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
    });
};

//get all in database
getAll = function (req, res, next) {
    Order.find({
        state: 'New',
    }
    ).
        select('_id description  size image date material').
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
        confirmed : 'true' ,
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
updateinfo = function (req, res, next) {
    const { comment, price, DeliveryDate } = req.body; 

    const order = {
        comment: comment,
        price: price,
        DeliveryDate: DeliveryDate,
        state:"InProgress",
    };

    Order.findOneAndUpdate({ _id: req.params.orderID }, { $set: order }, { new: true })
        .then(result => {
            if (!result) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }
            res.status(200).json({
                message: "Order updated",
                updatedOrder: result
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal server error",
                error: err
            });
        });
};

getReady = function (req, res, next) {

    Order.find({ state: 'Ready' })
        .populate('user', 'userName')
        .select('_id description image date price DeliveryDate user ')
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
        .select('_id description image date price DeliveryDate user ')
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

    Order.find({ 
        state: { $in: ['New'] },
        confirmed:'true',
         })
        .select('_id description image  size material  ')
        .then(doc => {
            console.log('Retrieved Orders:', doc);

            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        image: doc.image,
                        _id: doc._id,
                       materail: doc.materail,
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
   
}