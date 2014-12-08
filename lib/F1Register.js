'use strict';
var debug = require('debug')(require('../package.json').name + ':F1Register')
var F1 = require('fellowshipone')
var People = F1.People
var request = require('request')
var util = require('util')
var async = require('async')

function F1Register(f1, people) {
  Object.defineProperties(this, {
    f1: {
      // lazy-get this thing because the environment may not have the var
      // right this nanosecond... And besides, we don't really need it yet!
      get: function() {
        if (!f1) {
          debug('no f1 yet, creating anew...')
          f1 = new F1(readConfig())
        }
        return f1;
      }
    },
    people: {
      get: function() {
        if (!people) {
          people = new People(this.f1)
        }
        return people
      }
    }
  })
}

// either read it from the environment or from a file...
var readConfig = function() {
  return JSON.parse(process.env.F1_CONFIG)
}

var searchQuery = function(reg) {
  var query = {}
  var name = reg.Name
  query.searchFor = [name.First, name.Last].join(' ')
  query.communication = reg.Email

  return query
}

F1Register.prototype.validateReg = function(reg, callback) {
  process.nextTick(function() {
    if (!reg.Name) return callback('Registration invalid: no Name')
    if (!reg.Name.First) return callback('Registration invalid: no First Name')
    if (!reg.Name.Last) return callback('Registration invalid: no Last Name')
    if (!reg.Email) return callback('Registration invalid: no Email')
    callback()
  }.bind(this))
}

F1Register.prototype.register = function(reg, callback) {
  process.nextTick(function() {
    this.validateReg(reg, function(err) {
      if (err) return callback(err)

      debug('registering: %j', reg)
      var apiUrl = this.f1.config.apiUrl

      this.f1.get_token(function(err, creds, url) {
        if (err) return callback(err)

        debug('authenticated: %j', creds)
        debug('user url: %s', url)
        debug('api url: %s', apiUrl)

        var query = searchQuery(reg)

        this.people.search(query, function(err, result) {
          if (err) {
            debug('search error %j', err)
            return callback(err)
          }

          debug('search returned %j', result)

          // TODO: implement this!

          callback(null, util.format('Registered %j', reg))
        }.bind(this))
      }.bind(this))
    }.bind(this))
  }.bind(this))
}

module.exports = F1Register
