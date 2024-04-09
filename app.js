const express = require('express');
const app = express();
const connection = require('./connection');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 60,
  message: 'Too many request with this IP Address..Try again in 1 hour'
});



app.use('/library/api', limit);

const userRouter = require('./routes/userRouter');
const bookRouter = require('./routes/bookRouter');

app.use('/library/api/users', userRouter);
app.use('/library/api/books', bookRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // Send JSON response for errors
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
