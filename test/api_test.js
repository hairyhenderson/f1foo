'use strict';
var sinon = require('sinon')
var should = require('should')
var request = require('supertest')
var app = require('../app')

describe('API', function() {
  var r;

  beforeEach(function() {
    // r = sinon.mock(request)
  })

  function verifyAll() {
    // r.verify()
  }

  afterEach(function() {
    // r.restore()
  })

  it('GET / responds with 200', function(done) {
    request(app).get('/')
      .expect('Content-Length', 0)
      .expect(200, done)
  })

  it('GET /hooks responds with empty array', function(done) {
    request(app).get('/hooks')
      .expect('Content-Type', /json/)
      .expect([])
      .expect(200, done)
  })

  it('POST /hooks adds entry', function(done) {
    var body = {
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
      })
    }
    request(app).post('/hooks')
      .type('form')
      .send(body)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err)

        request(app).get('/hooks')
          .expect('Content-Type', /json/)
          .expect([{
            First: 'hello',
            Second: 'world'
          }])
          .expect(200, done)
      })
  })

  it('POST /hooks requires FieldStructure property', function(done) {
    request(app).post('/hooks')
      .type('form')
      .send({
        Field1: 'foo'
      })
      .expect(400, 'Missing FieldStructure', done)
  })
})
