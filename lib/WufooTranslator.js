'use strict';
var debug = require('debug')(require('../package.json').name + ':F1Register')
var async = require('async')
var _ = require('lodash')

function WufooTranslator() {}

WufooTranslator.prototype.translate = function(postBody, callback) {
  if (validBody(postBody)) {
    var struct = JSON.parse(postBody.FieldStructure)
    async.map(struct.Fields, function(item, callback) {
      var fieldmapping = {}
      fieldmapping[item.Title] = postBody[item.ID]
      callback(null, fieldmapping)
    }, function(err, fieldmappings) {
      if (err) return callback(err)

      async.reduce(fieldmappings, {}, function(memo, item, callback) {
        var key = _.keys(item)[0]
        memo[key] = item[key]
        callback(null, memo)
      }, function(err, sub) {
        async.filter(_.keys(postBody), function(item, callback) {
          callback(!(/FieldStructure/.test(item) || /FormStructure/.test(item) || /Field[0-9]+/.test(item)))
        }, function(items) {
          async.reduce(items, sub, function(memo, item, callback) {
            if (!memo.metadata) memo.metadata = {}
            memo.metadata[item] = postBody[item]
            callback(null, memo)
          }, callback)
        })
      })
    })
  } else {
    callback('Missing FieldStructure property')
  }
}

var validBody = function(body) {
  var valid = body &&
    body.FieldStructure &&
    typeof body.FieldStructure === 'string'
  try {
    if (valid) {
      JSON.parse(body.FieldStructure)
    }
    return valid
  } catch (e) {
    return false
  }
}

module.exports = WufooTranslator
