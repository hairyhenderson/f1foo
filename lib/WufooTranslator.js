var debug = require('debug')(require('../package.json').name + ':WufooTranslator')
var async = require('async')
var _ = require('lodash')

function WufooTranslator () {}

WufooTranslator.prototype.translate = function (postBody, callback) {
  process.nextTick(function () {
    if (validBody(postBody)) {
      debug('translating %j', postBody)
      var struct = JSON.parse(postBody.FieldStructure)
      async.reduce(struct.Fields, {}, function (memo, item, callback) {
        if (item.SubFields) {
          async.reduce(item.SubFields, {}, function (memo, item, callback) {
            memo[item.Label] = postBody[item.ID]
            callback(null, memo)
          }, function (err, items) {
            memo[item.Title] = items
            callback(err, memo)
          })
        } else {
          memo[item.Title] = postBody[item.ID]
          callback(null, memo)
        }
      }, function (err, sub) {
        if (err) {
          return callback(err)
        }
        async.filter(_.keys(postBody), function (item, callback) {
          callback(null, !(/FieldStructure/.test(item) || /FormStructure/.test(item) || /Field[0-9]+/.test(item)))
        }, function (err, items) {
          if (err) {
            return callback(err)
          }
          async.reduce(items, sub, function (memo, item, callback) {
            if (!memo.metadata) memo.metadata = {}
            memo.metadata[item] = postBody[item]
            callback(null, memo)
          }, callback)
        })
      })
    } else {
      debug('Missing FieldStructure in %j', postBody)
      callback('Missing FieldStructure property')
    }
  })
}

var validBody = function (body) {
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
