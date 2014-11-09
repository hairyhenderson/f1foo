var express = require('express')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.use(morgan('combined'))

app.use('/', require('./routes/index'))
app.use('/hooks', require('./routes/hooks'))

module.exports = app
