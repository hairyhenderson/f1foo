// A minimal mock of the Fellowship One API for testing against
'use strict';

var express = require('express')
var passport = require('passport')
var AnonymousStrategy = require('passport-anonymous').Strategy
var api = express.Router()

api.use(passport.initialize())

passport.use('anonymous', new AnonymousStrategy())

api.route('/PortalUser/AccessToken')
  .all(passport.authenticate('anonymous', {
    session: false
  }))
  .post(function(req, res) {
    res.setHeader('oauth_token', '1')
    res.setHeader('oauth_token_secret', '1')
    res.setHeader('content-location', '/foo')
    res.status(200).send()
  })
api.route('/People/Search')
.all(passport.authenticate('anonymous', {
  session: false
}))
.get(function(req, res) {
  res.status(200).send({})
})

module.exports = api
