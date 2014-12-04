'use strict';

var should = require('should')
var sinon = require('sinon')
var F1Register = require('../lib/F1Register')
var F1 = require('fellowshipone')

describe('F1Register', function() {
  var f1reg, f, f1

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
    f = sinon.mock(f1)
    f1reg = new F1Register(f1)
  })

  function verifyAll() {
    f.verify()
  }

  afterEach(function() {
    f.restore()
  })

  describe('register', function() {
    it('errors given authentication failure', function(done) {
      f.expects('get_token').yields("ERROR")

      f1reg.register({}, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
  })
})
