var express = require('express')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var app = express()

app.set('port', (process.env.VCAP_APP_PORT || process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended:true}))
app.use(morgan('combined'))

app.use('/', require('./routes/index'))
app.use('/hooks', require('./routes/hooks'))

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
