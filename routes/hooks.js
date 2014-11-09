'use strict';
var express = require('express')
var router = express.Router()
var util = require('util')
var async = require('async')
var _ = require('lodash')

var subs = []

router.get('/', function(request, response) {
  response.send(subs)
})

router.post('/', function(req, res) {
  if (req.body && req.body.FieldStructure) {

    postToSub(req.body, function(err, sub) {
      if (err) return res.status(400).end()

      subs.push(sub)
      res.status(200).send('OK')
    })
  } else {
    res.status(400).send('Missing FieldStructure')
  }
})

var postToSub = function(postBody, callback) {
  var struct = JSON.parse(postBody.FieldStructure)
  async.map(struct.Fields, function(item, callback) {
    var mapping = {}
    mapping[item.Title] = postBody[item.ID]
    callback(null, mapping)
  }, function(err, mappings) {
    if (err) return callback(err)

    async.reduce(mappings, {}, function(memo, item, callback) {
      var key = _.keys(item)[0]
      memo[key] = item[key]
      callback(null, memo)
    }, callback)
  })
}

module.exports = router
