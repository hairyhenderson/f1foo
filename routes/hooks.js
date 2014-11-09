'use strict';
var express = require('express')
var router = express.Router()
var util = require('util')

var subs = []

router.get('/', function(request, response) {
  response.send(subs)
})

router.post('/', function(req, res) {
  if (req.body && req.body.FieldStructure) {
    var sub = req.body
    console.log('field structure is %j', JSON.parse(sub.FieldStructure))

    sub.FieldStructure = undefined
    sub.FormStructure = undefined
    subs.push(sub)
    res.status(200).send('OK')
  } else {
    res.status(400).send('Missing FieldStructure')
  }
})

module.exports = router
