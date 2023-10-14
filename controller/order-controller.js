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
            // Handle multer error (e.g., file type not allowed, file size exceeded)
            return res.status(400).json({ message: 'File upload error', error: err.message });
        }

        // Continue processing the request
        console.log(req.file);
        const order = new Order({
            description: req.body.description,
            material: req.body.material,
            size: req.body.size,
            image: req.file.path,
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
    Order.find().
        select('_id description  size image ').
        then(doc => {
            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        size: doc.size,
                        image: doc.image,
                        _id: doc._id,
                        url: {
                            type: 'GET',
                            urls: 'localhost:3000/order/' + doc._id
                        }
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
        .then(doc => {
            if (doc && doc.length > 0) {
                res.status(200).json({
                    order: doc
                });
            } else {
                res.status(404).json({
                    message: 'Order not found'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Internal Server Error',
                error: err
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
        confirmed : req.body.confirmed ,
        
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

module.exports = {
    addOrder: addOrder,
    getAll: getAll,
    getallbyID: getallbyID,
    deleteOrder: deleteOrder,
    updateOrder: updateOrder,
}