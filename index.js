var express = require('express')
var cool = require('cool-ascii-faces')
var bodyParser = require('body-parser')
var app = express()

app.set('port', (process.env.VCAP_APP_PORT || process.env.PORT || 5000))

app.use(bodyParser.urlencoded())

app.use(express.static(__dirname + '/public'))


app.get('/', function(request, response) {
  response.send(cool())
})

app.post('/', function(req, res) {
  if (req.body) {
    console.log('got a body: %j', req.body)
    if (req.body.FieldStructure) {
      console.log('field structure is %j', JSON.parse(req.body.FieldStructure))
    }
  }
  res.status(200).send('Thanks!')
})

console.log('hello world')
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
