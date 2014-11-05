'use strict';
var express = require('express')
var router = express.Router()

var subs = []

router.get('/', function(request, response) {
  response.send(subs)
})

router.post('/', function(req, res) {
  if (req.body) {
    var sub = req.body
    console.log('got a body: %j', sub)
    if (req.body.FieldStructure) {
      console.log('field structure is %j', JSON.parse(req.body.FieldStructure))
    }
    sub.FieldStructure = undefined
    sub.FormStructure = undefined
    subs.push(sub)
    res.status(200).send('OK')
  } else {
    res.status(403).end()
  }

})

module.exports = router
