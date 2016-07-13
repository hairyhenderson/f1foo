var debug = require('debug')(require('../package.json').name + ':F1Register')
var F1 = require('fellowshipone')
var util = require('util')
var async = require('async')
var _ = require('lodash')

var NEW_STATUS = process.env.NEW_STATUS || 'New from Website'
var EMAIL = 'Email'
var PHONE = 'Telephone'
var HOME_PHONE = 'Home Phone'
var MOBILE_PHONE = 'Mobile Phone'

/**
 * @method F1Register
 * @param  {F1}   f1     The fellowshipone object - optional
 * @param  {F1.People}   people The F1 people object - optional
 */
function F1Register (f1, people) {
  Object.defineProperties(this, {
    f1: {
      // lazy-get this thing because the environment may not have the var
      // right this nanosecond... And besides, we don't really need it yet!
      get: function () {
        if (!f1) {
          debug('no f1 yet, creating anew...')
          f1 = new F1(JSON.parse(process.env.F1_CONFIG))
        }
        return f1
      }
    },
    people: {
      get: function () {
        if (!people) {
          people = new F1.People(this.f1)
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
F1Register.prototype.searchQuery = function (reg, callback) {
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
F1Register.prototype.validateReg = function (reg, callback) {
  function clientError (msg) {
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
F1Register.prototype.createPersonRecord = function (reg, callback) {
  this.getStatus(NEW_STATUS, function (err, status) {
    if (err) return callback(err)

    this.createHousehold(reg, function (err, householdResponse) {
      if (err) return callback(err)

      this.createPerson(householdResponse.household['@id'], status, reg, function (err, body) {
        if (err) return callback(err)

        debug('Person created: %j', body.person)

        this.createEmail(body.person, reg, function (err, emailResponse) {
          if (err) return callback(err)

          this.createAddress(body.person, reg, function (err, addr) {
            callback(err, body)
          })
        }.bind(this))
      }.bind(this))
    }.bind(this))
  }.bind(this))
}

F1Register.prototype._createComm = function (generalCommName, commName, person, reg, callback) {
  if (reg[commName]) {
    this.getCommunicationType(commName, function (err, commType) {
      if (err) return callback(err)

      var commObj = {
        person: _.pick(person, ['@id', '@uri']),
        communicationType: commType,
        communicationGeneralType: generalCommName,
        communicationValue: reg[commName],
        searchCommunicationValue: reg[commName],
        preferred: 'true'
      }

      var comms = new F1.PersonCommunications(this.f1, person['@id'])
      comms.create(commObj, callback)
    }.bind(this))
  } else {
    callback(null, {})
  }
}

F1Register.prototype.createHomePhone = function (person, reg, callback) {
  return this._createComm(PHONE, HOME_PHONE, person, reg, callback)
}

F1Register.prototype.createMobilePhone = function (person, reg, callback) {
  return this._createComm(PHONE, MOBILE_PHONE, person, reg, callback)
}

F1Register.prototype.createEmail = function (person, reg, callback) {
  return this._createComm(EMAIL, EMAIL, person, reg, callback)
}

F1Register.prototype.createPerson = function (householdID, status, reg, callback) {
  var person = {
    status: status,
    firstName: reg.Name.First,
    lastName: reg.Name.Last,
    '@householdID': householdID
  }
  debug('Creating person %j', person)

  var people = new F1.People(this.f1)
  people.create(person, callback)
}

F1Register.prototype.createHousehold = function (reg, callback) {
  var household = {
    householdName: reg.Name.First + ' ' + reg.Name.Last,
    householdSortName: reg.Name.Last,
    householdFirstName: reg.Name.First
  }

  var households = new F1.Households(this.f1)
  households.create(household, callback)
}

F1Register.prototype.getResourceByName = function (pluralResourceName, name, callback) {
  var resources = new F1[pluralResourceName](this.f1)
  resources.list(function (err, list) {
    if (err) return callback(err)

    async.filter(list, function (item, callback) {
      callback(null, item.name === name)
    }, function (err, items) {
      if (err) {
        return callback(err)
      }
      if (_.isEmpty(items)) {
        return callback('No ' + pluralResourceName + ' with name `' +
          name + '` could be found!')
      }

      return callback(null, items[0])
    })
  })
}

F1Register.prototype.getStatus = function (name, callback) {
  this.getResourceByName('Statuses', name, callback)
}

F1Register.prototype.getCommunicationType = function (name, callback) {
  this.getResourceByName('CommunicationTypes', name, callback)
}

F1Register.prototype.getAddressType = function (name, callback) {
  this.getResourceByName('AddressTypes', name, callback)
}

F1Register.prototype.createAddress = function (person, reg, callback) {
  this.getAddressType('Primary', function (err, addressType) {
    if (err) return callback(err)

    var address = {
      person: _.pick(person, ['@id', '@uri']),
      addressType: addressType,
      address1: reg.Address['Street Address'],
      address2: reg.Address['Address Line 2'],
      city: reg.Address.City,
      stProvince: reg.Address['State / Province / Region'],
      postalCode: reg.Address['Postal / Zip Code'],
      country: reg.Address.Country
    }
    var addresses = new F1.PersonAddresses(this.f1, person['@id'])
    addresses.create(address, callback)
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
F1Register.prototype.registerPerson = function (registration, person, callback) {
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
F1Register.prototype.ensureCreated = function (registration, person, callback) {
  if (!person) {
    this.createPersonRecord(registration, function (err, person) {
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

F1Register.prototype.handleDuplicateRecords = function (body, callback) {
  if (Number(body.results['@count']) > 1) {
    debug('Found returned duplicate records - registration will need to be handled manually')
    callback('Found returned duplicate records - registration will need to be handled manually')
  } else {
    callback(null, body)
  }
}

F1Register.prototype.register = function (reg, callback) {
  debug('registering: %j', reg)

  async.waterfall([
    this.f1.authenticate.bind(this.f1),
    this.validateReg.bind(this, reg),
    this.searchQuery.bind(this),
    this.people.search.bind(this.people),
    this.handleDuplicateRecords.bind(this),
    function handlePerson (body, next) {
      this.ensureCreated(reg, body.results.person, next)
    }.bind(this),
    this.registerPerson.bind(this)
  ],
    callback
  )
}

module.exports = F1Register
