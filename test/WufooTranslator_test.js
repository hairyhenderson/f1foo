'use strict';

var should = require('should')
var WufooTranslator = require('../lib/WufooTranslator')

describe('WufooTranslator', function() {
  var wt

  beforeEach(function() {
    wt = new WufooTranslator()
  })

  describe('translate', function() {
    it('requires FieldStructure', function(done) {
      wt.translate({}, function(err, sub) {
        err.should.not.be.empty
        done()
      })
    })
    it('requires FieldStructure to be a string', function(done) {
      wt.translate({
        FieldStructure: []
      }, function(err, sub) {
        err.should.not.be.empty
        done()
      })
    })
    it('requires FieldStrucutre to be a JSON string', function(done) {
      wt.translate({
        FieldStructure: 'foo'
      }, function(err, sub) {
        err.should.not.be.empty
        done()
      })
    })

    it('returns empty object given no fields', function(done) {
      wt.translate({
        FieldStructure: '{ "Fields": [] }'
      }, function(err, sub) {
        should(err).be.empty
        sub.should.eql({})
        done()
      })
    })

    it('returns object with proper field names', function(done) {
      wt.translate({
        Field1: 'Fred',
        FieldStructure: JSON.stringify({
          Fields: [{
            Title: 'Name',
            ID: 'Field1'
          }]
        })
      }, function(err, sub) {
        sub.should.eql({
          Name: 'Fred'
        })
        done()
      })
    })
  })
})
