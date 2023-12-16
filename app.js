var createError = require('http-errors');
var express = require('express');
var path =require('path');

var cookieParser = require('cookie-parser');
var logger = require('morgan');

const cors = require('cors');
const mongoos=require('mongoose');
const session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var orderRouter = require('./routes/order');
var newsRouter =require('./routes/news');
var transactionRouter = require('./routes/transaction');
var app = express();
 //// ejs 

app.set('view engine', 'ejs');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs')

app.use(logger('dev'));
//////////////
mongoos.connect('mongodb://127.0.0.1/shooping')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.use(cors());
app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'orderImage')));
app.use(express.static(path.join(__dirname,'userImage')));
app.use(express.static(path.join(__dirname,'newsImage')));

/////////

//////////
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/order',orderRouter);
app.use('/news',newsRouter);
app.use('/transaction',transactionRouter);
////////////



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message : err.message
  })
});

module.exports = app;
