'use strict';

var should = require('should')
var sinon = require('sinon')
var Hooks = require('../routes/hooks')
var F1Register = require('../lib/F1Register')
var F1 = require('fellowshipone')
var People = F1.People
var WufooTranslator = require('../lib/WufooTranslator')

describe('Hooks', function() {
  var f1reg, _f1reg, wt, _wt, hooks, _hooks, res, _res, f1, _f1, people, _people

  beforeEach(function() {
    f1 = new F1({
      "username": "foo",
      "password": "bar",
      "apiURL": "http://localhost",
      "oauth_credentials": {
        "consumer_key": "1",
        "consumer_secret": "1"
      }
    })
    people = new People(f1)
    _f1 = sinon.mock(f1)
    _people = sinon.mock(people)

    res = {
      status: function() {},
      send: function() {},
      end: function() {}
    }
    _res = sinon.mock(res)
    f1reg = new F1Register(f1, people)
    wt = new WufooTranslator()
    _f1reg = sinon.mock(f1reg)
    _wt = sinon.mock(wt)

    hooks = new Hooks(wt, f1reg)
    _hooks = sinon.mock(hooks)
  })

  function verifyAll() {
    _hooks.verify()
    _f1reg.verify()
    _wt.verify()
  }

  afterEach(function() {
    _hooks.restore()
    _f1reg.restore()
    _wt.restore()
  })

  describe('routes', function() {
    it('binds handler to /', function(done) {
      var router = hooks.routes()

      var rootRoute = router.stack[0]
      rootRoute.path.should.eql('/')
      rootRoute.route.methods.should.eql({
        post: true
      })
      rootRoute.handle.should.eql(hooks.handler.bind(hooks))

      verifyAll()
      done()
    })
  })

  describe('handler', function() {
    it('returns 400 with specified error message when validation fails', function(done) {
      _hooks.expects('validateBody').yields('error message')
      _res.expects('status').withArgs(400).returns(res)
      _res.expects('send').withArgs('error message').returns()

      hooks.handler({
        body: ''
      }, res)
      verifyAll()
      done()
    })

    it('returns custom error code when validation fails', function(done) {
      _hooks.expects('validateBody').yields(432)
      _res.expects('status').withArgs(432).returns(res)
      _res.expects('end').returns()

      hooks.handler({
        body: ''
      }, res)
      verifyAll()
      done()
    })

    it('returns 400 when translation fails', function(done) {
      _hooks.expects('validateBody').yields()
      _wt.expects('translate').yields('error')
      _res.expects('status').withArgs(400).returns(res)
      _res.expects('send').withArgs('error').returns()

      hooks.handler({
        body: ''
      }, res)
      verifyAll()
      done()
    })

    it('yields error when registration fails', function(done) {
      _hooks.expects('validateBody').yields()
      _wt.expects('translate').yields(null, {})
      _f1reg.expects('register').withArgs({}).yields('error')

      hooks.handler({
        body: ''
      }, res, function(err) {
        err.should.eql('error')
        verifyAll()
        done()
      })
    })
  })

  describe('validateBody', function() {
    var entry
    beforeEach(function() {
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
          }]
        }),
        Field106: 'Fred',
        Field107: 'Flinstone',
        Field114: 'fred@flinstone.com',
        IP: '127.0.0.1',
        HandshakeKey: ''
      }
      delete process.env.WUFOO_HANDSHAKE_KEY
    })

    it('requires body', function(done) {
      hooks.validateBody(null, function(err, body) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('requires FieldStructure', function(done) {
      hooks.validateBody({}, function(err, body) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('rejects entry with HandshakeKey when not expected', function(done) {
      entry.HandshakeKey = 'foo'

      hooks.validateBody(entry, function(err, body) {
        err.should.exist
        verifyAll()
        done()
      })
    })
    it('rejects entry with non-matching HandshakeKey', function(done) {
      process.env.WUFOO_HANDSHAKE_KEY = 'foo'
      entry.HandshakeKey = 'bar'

      hooks.validateBody(entry, function(err, body) {
        err.should.exist
        verifyAll()
        done()
      })
    })
    it('accepts entry with empty HandshakeKey', function(done) {
      entry.HandshakeKey = ''

      hooks.validateBody(entry, function(err, body) {
        should(err).not.exist
        verifyAll()
        done()
      })
    })
    it('accepts entry with matching HandshakeKey', function(done) {
      process.env.WUFOO_HANDSHAKE_KEY = 'foo'
      entry.HandshakeKey = 'foo'

      hooks.validateBody(entry, function(err, body) {
        should(err).not.exist
        verifyAll()
        done()
      })
    })
  })
})
