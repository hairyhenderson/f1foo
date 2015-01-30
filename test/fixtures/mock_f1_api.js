// A minimal mock of the Fellowship One API for testing against
'use strict';

var express = require('express')
var passport = require('passport')
var AnonymousStrategy = require('passport-anonymous').Strategy
var api = express.Router()

api.use(passport.initialize())

passport.use('anonymous', new AnonymousStrategy())

api.route('*')
  .all(passport.authenticate('anonymous', {
    session: false
  }))

api.route('/PortalUser/AccessToken')
  .post(function(req, res) {
    res.setHeader('oauth_token', '1')
    res.setHeader('oauth_token_secret', '1')
    res.setHeader('content-location', '/foo')
    res.status(200).send()
  })
api.route('/People/Search')
  .get(function(req, res) {
    res.status(200).send({
      "results": {
        "@count": "0",
        "@pageNumber": "",
        "@totalRecords": "0",
        "@additionalPages": "0"
      }
    })
  })
api.route('/People/Statuses')
  .get(function(req, res) {
    res.status(200).send({
      statuses: {
        status: [{
          "@id": "110",
          "@uri": "https://dc.staging.fellowshiponeapi.com/v1/People/Statuses/110",
          "name": "New from Website"
        }, {
          "@id": "12345",
          "@uri": "https://dc.staging.fellowshiponeapi.com/v1/People/Statuses/12345",
          "name": "New from Wufoo"
        }]
      }
    })
  })
api.route('/Households/New')
  .get(function(req, res) {
    res.status(200).send({
      household: {}
    })
  })
api.route('/Households')
  .post(function(req, res) {
    res.status(200).send({
      household: {}
    })
  })
api.route('/People/New')
  .get(function(req, res) {
    res.status(200).send({
      person: {}
    })
  })
api.route('/People')
  .post(function(req, res) {
    res.status(201).send()
  })
module.exports = api
