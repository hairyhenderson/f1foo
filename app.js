var express = require('express')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var app = express()

app.use(bodyParser.urlencoded({
  extended: true
}))
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

app.use('/', require('./routes/index'))
var Hooks = require('./routes/hooks')
var hooks = new Hooks()
app.use('/hooks', hooks.routes())
app.use(function (err, req, res, next) {
  /* istanbul ignore else */
  if (err.statusCode) {
    return res.status(err.statusCode).send(err.message)
  } else {
    return next(err, req, res)
  }
})

module.exports = app
