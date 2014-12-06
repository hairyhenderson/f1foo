'use strict';
var debug = require('debug')(require('../package.json').name + ':F1Register')
var F1 = require('fellowshipone')
var People = F1.People
var request = require('request')
var util = require('util')

function F1Register(f1) {
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
      },
      enumerable: true
    }
  })
}

// either read it from the environment or from a file...
var readConfig = function() {
  return JSON.parse(process.env.F1_CONFIG)
}

F1Register.prototype.register = function(subscription, callback) {
  debug('registering subscription: %j', subscription)
  var apiUrl = this.f1.config.apiUrl

  this.f1.get_token(function(err, creds, url) {
    if (err) return callback(err)

    debug('authenticated: %j', creds)
    debug('user url: %s', url)
    debug('api url: %s', apiUrl)

    var people = new People(this.f1)

    var query
    if (subscription.Name && subscription.Name.First && subscription.Name.Last) {
      query = {
        searchFor: subscription.Name.First + ' ' + subscription.Name.Last
      }
    } else {
      query = {}
    }

    people.search(query, function(err, result) {
      if (err) {
        debug('search error %j', err)
        return callback(err)
      }

      debug('search returned %j', result)

      // TODO: implement this!

      callback(null, util.format('Registered %j', subscription))
    }.bind(this))
  }.bind(this))
}

module.exports = F1Register
