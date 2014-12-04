'use strict';
var debug = require('debug')(require('../package.json').name + ':F1Register')
var F1 = require('fellowshipone')
var People = F1.People
var request = require('request')
var util = require('util')

function F1Register(f1) {
  this.f1 = f1 || new F1(readConfig())
}

// either read it from the environment or from a file...
var readConfig = function() {
  if (process.env.F1_CONFIG) {
    return JSON.parse(process.env.F1_CONFIG)
  } else {
    try {
      return require('../f1config.json')
    } catch (e) {
      return {}
    }
  }
}

F1Register.prototype.register = function(subscription, callback) {
  debug('registering subscription: %j', subscription)
  if (!this.f1.config.apiUrl) {
    this.f1.config = readConfig()
  }
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
