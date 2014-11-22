'use strict';
var debug = require('debug')(require('../package.json').name + ':routes:hooks')
var express = require('express')
var router = express.Router()

var WufooTranslator = require('../lib/WufooTranslator')
var F1Register = require('../lib/F1Register')

var wt = new WufooTranslator()
var f1reg = new F1Register()

var handler = function(req, res, next) {
  validateBody(req.body, function valid(err) {
    if (typeof(err) === 'string') return res.status(400).send(err)
    if (typeof(err) === 'number') return res.status(err).end()

    wt.translate(req.body, function(err, sub) {
      if (err) return res.status(400).end()

      f1reg.register(sub, function(err, status) {
        if (err) {
          debug(err)
          return next(err)
        }

        res.status(200).send(status)
      })
    })
  })
}

var validateBody = function(body, callback) {
  if (!body) {
    debug('missing body (%j)', body)
    return callback('missing body')
  } else if (!body.FieldStructure) {
    debug('missing form metadata (%j)', body)
    return callback('missing form metadata')
  } else if (body.HandshakeKey !== process.env.WUFOO_HANDSHAKE_KEY) {
    debug('%j !== %j', body.HandshakeKey, process.env.WUFOO_HANDSHAKE_KEY)
    return callback(401)
  } else {
    return callback()
  }
}

router.post('/', handler)

module.exports = router
