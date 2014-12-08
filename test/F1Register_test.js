'use strict';

var should = require('should')
var sinon = require('sinon')
var F1Register = require('../lib/F1Register')
var F1 = require('fellowshipone')
var People = F1.People

describe('F1Register', function() {
  var f1reg, _f1, f1, people, _people, _f1reg

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
    f1reg = new F1Register(f1, people)
    _f1reg = sinon.mock(f1reg)
  })

  function verifyAll() {
    _f1.verify()
    _people.verify()
    _f1reg.verify()
  }

  afterEach(function() {
    _f1.restore()
    _people.restore()
    _f1reg.restore()
  })

  var sub
  beforeEach(function() {
    sub = {
      Name: {
        First: 'Fred',
        Last: 'Flintstone'
      },
      Email: 'fred@flintstone.com'
    }
  })

  describe('validateReg', function() {
    it('requires Name', function(done) {
      delete sub.Name

      f1reg.validateReg(sub, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
    it('requires Name.First', function(done) {
      delete sub.Name.First

      f1reg.validateReg(sub, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
    it('requires Name.Last', function(done) {
      delete sub.Name.Last

      f1reg.validateReg(sub, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
    it('requires Email', function(done) {
      delete sub.Email

      f1reg.validateReg(sub, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
  })

  describe('register', function() {
    it('yields error given validation failure', function(done) {
      _f1reg.expects('validateReg').yields('error')

      f1reg.register({}, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('errors given authentication failure', function(done) {
      _f1reg.expects('validateReg').yields()
      _f1.expects('get_token').yields("ERROR")

      f1reg.register({
        Name: {}
      }, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('yields error given people search error', function(done) {
      _f1reg.expects('validateReg').yields()
      _f1.expects('get_token').yields()
      _people.expects('search').withArgs({
        searchFor: 'Fred Flintstone',
        communication: sub.Email
      }).yields('ERROR')

      f1reg.register(sub, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
  })
})
