const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
  },
 user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'user',
  }, 
  comment: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  DeliveryDate : {
    type: Date,
    required: true,
  },
});

module.exports= mongoose.model('transaction', transactionSchema);

