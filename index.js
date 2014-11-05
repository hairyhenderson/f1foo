var express = require('express')
var cool = require('cool-ascii-faces')
var bodyParser = require('body-parser')
var app = express()

app.set('port', (process.env.VCAP_APP_PORT || process.env.PORT || 5000))

app.use(bodyParser.urlencoded())

app.use(express.static(__dirname + '/public'))

var subs = []

app.get('/', function(request, response) {
  response.send(subs)
})

app.post('/', function(req, res) {
  if (req.body) {
    var sub = req.body
    console.log('got a body: %j', sub)
    if (req.body.FieldStructure) {
      console.log('field structure is %j', JSON.parse(req.body.FieldStructure))
    }
    sub.FieldStructure = undefined
    sub.FormStructure = undefined
    subs.add(sub)
    res.status(200).send('OK')
  } else {
    res.status(403).end()
  }

})

console.log('hello world')
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
