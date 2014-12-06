'use strict';
var util = require('util')
var sinon = require('sinon')
var should = require('should')
  // var req = require('request')
var request = require('supertest')

describe('API', function() {
  var app, r

  before(function() {

    app = require('../app')
    request = request(app)
    var port = request.get().app.address().port
    var path = '/f1/v1'
    process.env.F1_CONFIG = JSON.stringify({
      "apiURL": "http://localhost:" + port + path,
      "oauth_credentials": {
        "consumer_key": "1",
        "consumer_secret": "1"
      },
      username: 'john',
      password: 'doe'
    })

    var f1api = require('./fixtures/mock_f1_api')
    app.use(path, f1api)
  })

  it('GET / responds with 200', function(done) {
    request.get('/')
      .expect('Content-Length', 0)
      .expect(200, done)
  })

  describe('POST /hooks', function() {
    var entry
    beforeEach(function() {
      entry = {
        Field1: 'hello',
        Field2: 'world',
        FieldStructure: JSON.stringify({
          Fields: [{
            Title: 'First',
            Instructions: '',
            IsRequired: '0',
            ClassNames: '',
            DefaultVal: '',
            Page: '1',
            Type: 'text',
            ID: 'Field1'
          }, {
            Title: 'Second',
            Instructions: '',
            IsRequired: '0',
            ClassNames: '',
            DefaultVal: '',
            Page: '1',
            Type: 'url',
            ID: 'Field2'
          }]
        }),
        IP: '1.2.3.4'
      }
      delete process.env.WUFOO_HANDSHAKE_KEY
    })

    it('accepts well-formed entry', function(done) {
      var body = entry

      request.post('/hooks')
        .type('form')
        .send(body)
        .expect(200, done)
    })

    it('requires FieldStructure property', function(done) {
      request.post('/hooks')
        .type('form')
        .send({
          Field1: 'foo'
        })
        .expect(400, 'missing form metadata', done)
    })

    it('rejects entry with HandshakeKey when not expected', function(done) {
      entry.HandshakeKey = 'foo'

      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(401, done)
    })
    it('rejects entry with non-matching HandshakeKey', function(done) {
      process.env.WUFOO_HANDSHAKE_KEY = 'foo'
      entry.HandshakeKey = 'bar'

      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(401, done)
    })
    it('accepts entry with empty HandshakeKey', function(done) {
      entry.HandshakeKey = ''

      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(200, done)
    })
    it('accepts entry with matching HandshakeKey', function(done) {
      process.env.WUFOO_HANDSHAKE_KEY = 'foo'
      entry.HandshakeKey = 'foo'

      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(200, done)
    })
  })
})
