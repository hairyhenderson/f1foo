var debug = require('debug')(require('../package.json').name + ':routes:hooks')
var express = require('express')
var router = express.Router()

var WufooTranslator = require('../lib/WufooTranslator')
var F1Register = require('../lib/F1Register')

function Hooks (wt, f1reg) {
  Object.defineProperties(this, {
    wt: {
      get: function () {
        if (!wt) {
          debug('no wt yet, creating anew...')
          wt = new WufooTranslator()
        }
        return wt
      }
    },
    f1reg: {
      get: function () {
        if (!f1reg) {
          f1reg = new F1Register()
        }
        return f1reg
      }
    }
  })
}

Hooks.prototype.routes = function () {
  router.post('/', this.handler.bind(this))
  return router
}

Hooks.prototype.handler = function (req, res, next) {
  this.validateBody(req.body, function valid (err) {
    if (typeof (err) === 'string') return res.status(400).send(err)
    if (typeof (err) === 'number') return res.status(err).end()

    this.wt.translate(req.body, function (err, sub) {
      if (err) return res.status(400).send(err)

      this.f1reg.register(sub, function (err, status) {
        if (err) {
          debug(err)
          return next(err)
        }

        res.status(200).send(status)
      })
    }.bind(this))
  }.bind(this))
}

Hooks.prototype.validateBody = function (body, callback) {
  if (!body) {
    debug('missing body (%j)', body)
    return callback('missing body')
  } else if (!body.FieldStructure) {
    debug('missing form metadata (%j)', body)
    return callback('missing form metadata')
  } else if (!body.HandshakeKey && !process.env.WUFOO_HANDSHAKE_KEY) {
    debug('No HandshakeKey set (%j ~= %j)', body.HandshakeKey, process.env.WUFOO_HANDSHAKE_KEY)
    return callback()
  } else if (body.HandshakeKey !== process.env.WUFOO_HANDSHAKE_KEY) {
    debug('%j !== %j', body.HandshakeKey, process.env.WUFOO_HANDSHAKE_KEY)
    return callback(401)
  } else {
    return callback()
  }
}

module.exports = Hooks
