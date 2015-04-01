// A minimal mock of the Fellowship One API for testing against
'use strict';

var express = require('express')
var passport = require('passport')
var AnonymousStrategy = require('passport-anonymous').Strategy
var api = express.Router()

function resource(path, name) {
  var obj = {}
  obj[name] = {
    '@id': '1'
  }
  api.route(path + '/New').get(function(req, res) {
    res.status(200).send(obj)
  })
  api.route(path).post(function(req, res) {
    res.status(201).send(obj)
  })
}

function staticResource(path, reply) {
  api.route(path).get(function(req, res) {
    res.status(200).send(reply)
  })
}

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

staticResource('/People/Search', {
  "results": {
    "@count": "0",
    "@pageNumber": "",
    "@totalRecords": "0",
    "@additionalPages": "0"
  }
})
staticResource('/People/Statuses', {
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
staticResource('/Communications/CommunicationTypes', {
  communicationTypes: {
    communicationType: [{
      '@id': '1',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Communications/CommunicationTypes/1',
      '@generalType': 'Telephone',
      name: 'Home Phone'
    }, {
      '@id': '5',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Communications/CommunicationTypes/5',
      '@generalType': 'Email',
      name: 'Home Email'
    }, {
      '@id': '4',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Communications/CommunicationTypes/4',
      '@generalType': 'Email',
      name: 'Email'
    }]
  }
})
staticResource('/Addresses/AddressTypes', {
  addressTypes: {
    addressType: [{
      '@id': '1',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Addresses/AddressTypes/1',
      name: 'Primary'
    }]
  }
})

resource('/People', 'person')
resource('/Households', 'household')
resource('/People/:id/Addresses', 'address')
resource('/People/:id/Communications', 'communication')

module.exports = api
