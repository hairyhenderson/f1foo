require('should')
var request = require('supertest')

describe('API', function () {
  var app

  before(function () {
    app = require('../app')
    request = request(app)
    var port = request.get('').app.address().port
    var path = '/f1/v1'
    process.env.F1_CONFIG = JSON.stringify({
      'apiURL': 'http://localhost:' + port + path,
      'oauth_credentials': {
        'consumer_key': '1',
        'consumer_secret': '1'
      },
      username: 'john',
      password: 'doe'
    })

    var f1api = require('./fixtures/mock_f1_api')
    app.use(path, f1api)
  })

  it('GET / responds with 200', function (done) {
    request.get('/')
      .expect('Content-Length', '0')
      .expect(200, done)
  })

  describe('POST /hooks', function () {
    var entry
    beforeEach(function () {
      entry = {
        FieldStructure: JSON.stringify({
          Fields: [{
            Title: 'Name',
            Instructions: '',
            IsRequired: '0',
            ClassNames: '',
            DefaultVal: '',
            Page: '1',
            SubFields: [{
              DefaultVal: '',
              ID: 'Field106',
              Label: 'First'
            }, {
              DefaultVal: '',
              ID: 'Field107',
              Label: 'Last'
            }],
            Type: 'shortname',
            ID: 'Field106'
          }, {
            Title: 'Email',
            Instructions: '',
            IsRequired: '0',
            ClassNames: '',
            DefaultVal: '',
            Page: '1',
            Type: 'email',
            ID: 'Field114'
          }, {
            Title: 'Address',
            Instructions: '',
            IsRequired: '0',
            ClassNames: '',
            DefaultVal: '',
            Page: '1',
            SubFields: [{
              DefaultVal: '',
              ID: 'Field108',
              Label: 'Street Address'
            }, {
              DefaultVal: '',
              ID: 'Field109',
              Label: 'Address Line 2'
            }, {
              DefaultVal: '',
              ID: 'Field110',
              Label: 'City'
            }, {
              DefaultVal: '',
              ID: 'Field111',
              Label: 'State / Province / Region'
            }, {
              DefaultVal: '',
              ID: 'Field112',
              Label: 'Postal / Zip Code'
            }, {
              DefaultVal: '',
              ID: 'Field113',
              Label: 'Country'
            }],
            Type: 'address',
            ID: 'Field108'
          }, {
            Title: 'Home Phone',
            Instructions: '',
            IsRequired: '0',
            ClassNames: 'leftHalf',
            DefaultVal: '',
            Page: '1',
            Type: 'phone',
            ID: 'Field4'
          }, {
            Title: 'Mobile Phone',
            Instructions: '',
            IsRequired: '0',
            ClassNames: 'rightHalf',
            DefaultVal: '',
            Page: '1',
            Type: 'phone',
            ID: 'Field5'
          }]
        }),
        Field106: 'Fred',
        Field107: 'Flinstone',
        Field114: 'fred@flinstone.com',
        Field108: '301 Cobblestone Way',
        Field109: '',
        Field110: 'Bedrock',
        Field111: 'South Dakota',
        Field112: '12345',
        Field113: 'United States',
        Field4: '555-555-1212',
        Field5: '543-210-0123',
        IP: '127.0.0.1',
        HandshakeKey: ''
      }
      delete process.env.WUFOO_HANDSHAKE_KEY
    })

    it('accepts well-formed entry', function (done) {
      var body = entry

      request.post('/hooks')
        .type('form')
        .send(body)
        .expect(200, done)
    })

    it('requires FieldStructure property', function (done) {
      request.post('/hooks')
        .type('form')
        .send({
          Field1: 'foo'
        })
        .expect(400, 'missing form metadata', done)
    })

    it('requires non-empty first name', function (done) {
      entry.Field106 = ''
      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(400, 'Registration invalid: no First Name', done)
    })

    it('requires non-empty last name', function (done) {
      entry.Field107 = ''
      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(400, 'Registration invalid: no Last Name', done)
    })

    it('requires non-empty e-mail', function (done) {
      entry.Field114 = ''
      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(400, 'Registration invalid: no Email', done)
    })

    it('rejects entry with HandshakeKey when not expected', function (done) {
      entry.HandshakeKey = 'foo'

      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(401, done)
    })
    it('rejects entry with non-matching HandshakeKey', function (done) {
      process.env.WUFOO_HANDSHAKE_KEY = 'foo'
      entry.HandshakeKey = 'bar'

      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(401, done)
    })
    it('accepts entry with empty HandshakeKey', function (done) {
      entry.HandshakeKey = ''

      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(200, done)
    })
    it('accepts entry with matching HandshakeKey', function (done) {
      process.env.WUFOO_HANDSHAKE_KEY = 'foo'
      entry.HandshakeKey = 'foo'

      request.post('/hooks')
        .type('form')
        .send(entry)
        .expect(200, done)
    })
  })
})
