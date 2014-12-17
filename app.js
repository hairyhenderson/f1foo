'use strict';
var debug = require('debug')(require('./package.json').name + ':app')

var express = require('express')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var app = express()

app.use(bodyParser.urlencoded({
  extended: true
}))
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test')
  app.use(morgan('combined'))

app.use('/', require('./routes/index'))
var Hooks = require('./routes/hooks')
var hooks = new Hooks()
app.use('/hooks', hooks.routes())

module.exports = app
