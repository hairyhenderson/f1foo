'use strict';
var debug = require('debug')(require('../package.json').name + ':routes:hooks')
var express = require('express')
var router = express.Router()

var WufooTranslator = require('../lib/WufooTranslator')
var F1Register = require('../lib/F1Register')

var wt = new WufooTranslator()
var f1reg = new F1Register()

var handler = function(req, res, next) {
  if (req.body && req.body.FieldStructure) {
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
  } else {
    res.status(400).send('Missing FieldStructure')
  }
}

router.post('/', handler)

module.exports = router
