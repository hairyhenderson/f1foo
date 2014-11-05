var express = require('express')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var app = express()

app.set('port', (process.env.VCAP_APP_PORT || process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended:true}))
app.use(morgan('combined'))
// app.use(express.static(__dirname + '/public'))

app.use('/', require('./routes/hooks'))

console.log('hello world')
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
