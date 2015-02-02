'use strict';
var debug = require('debug')(require('../package.json').name + ':F1Register')
var F1 = require('fellowshipone')
var request = require('request')
var util = require('util')
var async = require('async')
var _ = require('lodash')

var NEW_STATUS = process.env.NEW_STATUS || 'New from Website'
var EMAIL = 'Email'

/**
 * @method F1Register
 * @param  {F1}   f1     The fellowshipone object - optional
 * @param  {F1.People}   people The F1 people object - optional
 */
function F1Register(f1, people, households, statuses, communicationTypes) {
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
          people = new F1.People(this.f1)
        }
        return people
      }
    },
    households: {
      get: function() {
        if (!households) {
          households = new F1.Households(this.f1)
        }
        return households
      }
    },
    statuses: {
      get: function() {
        if (!statuses) {
          statuses = new F1.Statuses(this.f1)
        }
        return statuses
      }
    },
    communicationTypes: {
      get: function() {
        if (!communicationTypes) {
          communicationTypes = new F1.CommunicationTypes(this.f1)
        }
        return communicationTypes
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
  function clientError(msg) {
    debug('%s - %j', msg, reg)
    return callback({
      statusCode: 400,
      message: msg
    })
  }
  if (!reg.Name) return clientError('Registration invalid: no Name')
  if (!reg.Name.First) return clientError('Registration invalid: no First Name')
  if (!reg.Name.Last) return clientError('Registration invalid: no Last Name')
  if (!reg.Email) return clientError('Registration invalid: no Email')
  callback(null, reg)
}

/**
 * Create a new Person record in F1 based on the given registration
 *
 * @method createPerson
 * @param  {[type]}     reg      [description]
 * @param  {Function}   callback [description]
 */
F1Register.prototype.createPerson = function(reg, callback) {
  this.statuses.list(function(err, statusList) {
    if (err) return callback(err)

    async.filter(statusList, function(item, callback) {
      callback(item.name == NEW_STATUS)
    }, function(items) {
      if (_.isEmpty(items)) return callback('No Status named `' + NEW_STATUS + '` could be found!')
      var person = {
        status: items[0],
        firstName: reg.Name.First,
        lastName: reg.Name.Last
      }
      debug('Creating person %j', person)
      var household = {
        householdName: reg.Name.First + ' ' + reg.Name.Last,
        householdSortName: reg.Name.Last,
        householdFirstName: reg.Name.First
      }
      var email = {
        communicationGeneralType: 'Email',
        communicationValue: reg.Email,
        searchCommunicationValue: reg.Email,
        preferred: 'true'
      }
      this.households.create(household, function(err, body) {
        if (err) return callback(err)

        person['@householdID'] = body.household['@id']
        this.people.create(person, function(err, body) {
          if (err) return callback(err)

          debug('Person created: %j', body.person)

          email.person = _.pick(body.person, ['@id', '@uri'])

          this.communicationTypes.list(function(err, commTypeList) {
            if (err) return callback(err)

            async.filter(commTypeList, function(item, callback) {
              callback(item.name == EMAIL)
            }, function(items) {
              if (_.isEmpty(items)) return callback('No CommunicationType named `' + EMAIL + '` could be found!')

              email.communicationType = items[0]
              var comms = new F1.PersonCommunications(this.f1, body.person['@id'])
              comms.create(email, function(err, commsBody) {
                if (err) return callback(err)

                callback(err, body)
              }.bind(this))
            }.bind(this))
          }.bind(this))
        }.bind(this))
      }.bind(this))
    }.bind(this))
  }.bind(this))
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
  var msg = util.format('Registered %j', registration)
  debug(msg)
  callback(null, msg)
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
      if (err) return callback(err)

      debug('New person `%s %s` created at id %s', registration.Name.First,
        registration.Name.Last, person.person['@id'])
      callback(null, registration, person)
    })
  } else {
    debug('Person found')
    callback(null, registration, person)
  }
}

F1Register.prototype.handleDuplicateRecords = function(body, callback) {
  if (Number(body.results['@count']) > 1) {
    debug('Found returned duplicate records - registration will need to be handled manually')
    callback('Found returned duplicate records - registration will need to be handled manually')
  } else
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
