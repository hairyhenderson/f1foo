var express = require('express')
var cool = require('cool-ascii-faces');
var app = express();

app.set('port', (process.env.VCAP_APP_PORT || process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send(cool())
})

console.log('hello world')
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
