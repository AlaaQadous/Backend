const Transaction = require('../models/transaction');
const Order = require('../models/order');
const addTran = function (req, res, next) {
    console.log(req.file);
    const tran = new Transaction({
        comment: req.body.comment,
        price: req.body.price,
        DeliveryDate: req.body.DeliveryDate,
    });

    tran.save()
        .then(doc => {
            res.status(200).json({
                message: 'Information created successfully',
                order: doc
            });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({
                message: 'Internal Server Error',
            });
        });
};
    
const addTransaction = function (req, res) {
    const { orderID, comment, price, DeliveryDate } = req.body;
    const transaction = new Transaction({
        order: orderID,
        comment: comment,
        price: price,
        DeliveryDate: DeliveryDate,
    });
    transaction.save()
        .then(doc => {
            res.status(200).json({
                message: 'Transaction created successfully',
                transaction: doc,
            });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({
                message: 'Internal Server Error',
            });
        });
};

const addTransaction1 = async function (req,res) {
    try {
        const { orderID, comment, price, DeliveryDate } = req.body;

        const transaction = new Transaction({
            order: orderID,
            user: userID,
            comment: comment,
            price: price,
            DeliveryDate: DeliveryDate,
        });

        const savedTransaction = await transaction.save();

        const user = await User.findById(userID);

        console.log('Transaction added successfully:',
         { transaction: savedTransaction, user: user });
        return { transaction: savedTransaction, user: user };
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
};

module.exports = {
    addTran,
    addTransaction,
};
