'use strict';
var debug = require('debug')(require('../package.json').name + ':F1Register')
var F1 = require('fellowshipone')
var People = F1.People
var request = require('request')
var util = require('util')
var async = require('async')

/**
 * @method F1Register
 * @param  {F1}   f1     The fellowshipone object - optional
 * @param  {F1.People}   people The F1 people object - optional
 */
function F1Register(f1, people) {
  Object.defineProperties(this, {
    f1: {
      // lazy-get this thing because the environment may not have the var
      // right this nanosecond... And besides, we don't really need it yet!
      get: function() {
        if (!f1) {
          debug('no f1 yet, creating anew...')
          f1 = new F1(JSON.parse(process.env.F1_CONFIG))
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

/**
 * Create a query object based on the given registration data
 *
 * @method searchQuery
 * @param  {[type]}    reg      [description]
 * @param  {Function}  callback [description]
 */
F1Register.prototype.searchQuery = function(reg, callback) {
  var query = {}
  var name = reg.Name
  query.searchFor = [name.First, name.Last].join(' ')
  query.communication = reg.Email

  callback(null, query)
}

/**
 * Validate the given registration. yields an error if it's not valid, otherwise passes it through.
 *
 * @method validateReg
 * @param  {[type]}    reg      [description]
 * @param  {Function}  callback [description]
 */
F1Register.prototype.validateReg = function(reg, callback) {
  if (!reg.Name) return callback('Registration invalid: no Name')
  if (!reg.Name.First) return callback('Registration invalid: no First Name')
  if (!reg.Name.Last) return callback('Registration invalid: no Last Name')
  if (!reg.Email) return callback('Registration invalid: no Email')
  callback(null, reg)
}

/**
 * Create a new Person record in F1 based on the given registration
 *
 * TODO: implement this...
 *
 * @method createPerson
 * @param  {[type]}     reg      [description]
 * @param  {Function}   callback [description]
 */
F1Register.prototype.createPerson = function(reg, callback) {
  callback()
}

/**
 * TODO: implement this...
 *
 * @method registerPerson
 * @param  {[type]}       registration [description]
 * @param  {[type]}       people       [description]
 * @param  {Function}     callback     [description]
 */
F1Register.prototype.registerPerson = function(registration, person, callback) {
  callback(null, util.format('Registered %j', registration))
}

/**
 * Ensure that a person record gets created if necessary.
 *
 * @method ensureCreated
 * @param  {[type]}      registration the form submission object
 * @param  {[type]}      person       the person object. May be null or undefined - if so a new person record will be created.
 * @param  {Function}    callback     yields an error (if received) and the person object.
 */
F1Register.prototype.ensureCreated = function(registration, person, callback) {
  if (!person) {
    this.createPerson(registration, function(err, person) {
      callback(err, registration, person)
    })
  } else {
    callback(null, registration, person)
  }
}

F1Register.prototype.handleDuplicateRecords = function(body, callback) {
  if (Number(body.results['@count']) > 1)
    callback('Found returned duplicate records - registration will need to be handled manually')
  else
    callback(null, body)
}

F1Register.prototype.register = function(reg, callback) {
  debug('registering: %j', reg)

  async.waterfall([
      this.f1.authenticate.bind(this.f1),
      this.validateReg.bind(this, reg),
      this.searchQuery.bind(this),
      this.people.search.bind(this.people),
      this.handleDuplicateRecords.bind(this),
      function handlePerson(body, next) {
        this.ensureCreated(reg, body.results.person, next)
      }.bind(this),
      this.registerPerson.bind(this)
    ],
    callback
  )
}

module.exports = F1Register
