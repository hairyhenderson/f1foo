'use strict';

var should = require('should')
var sinon = require('sinon')
var _ = require('lodash')
var F1Register = require('../lib/F1Register')
var F1 = require('fellowshipone')

describe('F1Register', function() {
  var f1reg, _f1, f1, people, _people, _f1reg, _households,
    households, statuses, _statuses, _F1, communicationTypes, _communicationTypes

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
    people = new F1.People(f1)
    households = new F1.Households(f1)
    statuses = new F1.Statuses(f1)
    communicationTypes = new F1.CommunicationTypes(f1)
    _F1 = sinon.mock(F1)
    _f1 = sinon.mock(f1)
    _people = sinon.mock(people)
    _households = sinon.mock(households)
    _statuses = sinon.mock(statuses)
    _communicationTypes = sinon.mock(communicationTypes)
    f1reg = new F1Register(f1, people, households, statuses, communicationTypes)
    _f1reg = sinon.mock(f1reg)
  })

  function verifyAll() {
    _f1.verify()
    _people.verify()
    _f1reg.verify()
    _households.verify()
    _statuses.verify()
    _F1.verify()
    _communicationTypes.verify()
  }

  afterEach(function() {
    _f1.restore()
    _people.restore()
    _f1reg.restore()
    _households.restore()
    _statuses.restore()
    _F1.restore()
    _communicationTypes.restore()
  })

  var sub, status, household, person, emailComm, emailCommType, addressType, address
  beforeEach(function() {
    sub = {
      Name: {
        First: 'Fred',
        Last: 'Flintstone'
      },
      Email: 'fred@flintstone.com',
      Address: {
        'Street Address': '301 Cobblestone Way',
        'Address Line 2': '',
        'City': 'Bedrock',
        'State / Province / Region': 'South Dakota',
        'Postal / Zip Code': '12345',
        'Country': 'United States'
      }
    }
    status = {
      '@id': '110',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/People/Statuses/110',
      name: 'New from Website'
    }
    household = {
      '@id': '12345678',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Households/12345678',
      householdName: sub.Name.First + ' ' + sub.Name.Last,
      householdSortName: sub.Name.Last,
      householdFirstName: sub.Name.First,
      createdDate: '2015-01-01T00:00:00',
      lastUpdatedDate: '2015-01-01T00:00:00'
    }
    person = {
      '@id': '123',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/People/123',
      status: status,
      firstName: sub.Name.First,
      lastName: sub.Name.Last,
      '@householdID': household['@id']
    }
    emailCommType = {
      '@id': '4',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Communications/CommunicationTypes/4',
      '@generalType': 'Email',
      name: 'Email'
    }
    emailComm = {
      '@id': '123456',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Communications/123456',
      person: _.pick(person, ['@id', '@uri']),
      communicationType: emailCommType,
      communicationGeneralType: 'Email',
      communicationValue: sub.Email,
      searchCommunicationValue: sub.Email,
      preferred: "true",
      createdDate: '2015-01-01T00:00:00',
      lastUpdatedDate: '2015-01-01T00:00:00'
    }
    addressType = {
      '@id': '1',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Addresses/AddressTypes/1',
      name: 'Primary'
    }
    address = {
      '@id': '1234',
      '@uri': 'https://demo.fellowshiponeapi.com/v1/Addresses/1234',
      person: _.pick(person, ['@id', '@uri']),
      addressType: addressType,
      address1: sub.Address['Street Address'],
      address2: sub.Address['Address Line 2'],
      address3: null,
      city: sub.Address.City,
      postalCode: sub.Address['Postal / Zip Code'],
      county: null,
      country: sub.Address.Country,
      stProvince: sub.Address['State / Province / Region'],
      carrierRoute: null,
      deliveryPoint: null,
      addressDate: '2015-01-01T00:00:00',
      addressComment: null,
      uspsVerified: 'false',
      addressVerifiedDate: null,
      lastVerificationAttemptDate: null,
      createdDate: '2015-01-01T00:00:00',
      lastUpdatedDate: '2015-01-01T00:00:00'
    }
  })

  describe('searchQuery', function() {
    it('yields query based on valid registration object', function(done) {
      f1reg.searchQuery(sub, function(err, query) {
        query.should.eql({
          searchFor: 'Fred Flintstone',
          communication: 'fred@flintstone.com'
        })

        verifyAll()
        done()
      })
    })
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
    it('sets statusCode to 400', function(done) {
      delete sub.Email

      f1reg.validateReg(sub, function(err) {
        err.statusCode.should.eql(400)
        verifyAll()
        done()
      })
    })
    it('sets message', function(done) {
      delete sub.Email

      f1reg.validateReg(sub, function(err) {
        err.message.should.not.be.empty
        verifyAll()
        done()
      })
    })
  })

  describe('register', function() {
    it('yields error given authentication failure', function(done) {
      _f1.expects('authenticate').yields("ERROR")

      f1reg.register({
        Name: {}
      }, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('yields error given validation failure', function(done) {
      _f1.expects('authenticate').yields()
      _f1reg.expects('validateReg').yields('error')

      f1reg.register({}, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('yields error given people search error', function(done) {
      var query = {
        searchFor: 'Fred Flintstone',
        communication: sub.Email
      }

      _f1.expects('authenticate').yields()
      _f1reg.expects('validateReg').yields(null, sub)
      _f1reg.expects('searchQuery').withArgs(sub).yields(null, query)
      _people.expects('search').withArgs(query).yields('ERROR')

      f1reg.register(sub, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('yields error when more than one person record is found', function(done) {
      _f1reg.expects('validateReg').yields(null, sub)
      _f1.expects('authenticate').yields()
      _people.expects('search').withArgs({
        searchFor: 'Fred Flintstone',
        communication: sub.Email
      }).yields(null, {
        results: {
          '@count': '2',
          person: [{}, {}]
        }
      })

      f1reg.register(sub, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('yields error when can\'t ensure the person exists', function(done) {
      _f1reg.expects('validateReg').yields(null, sub)
      _f1.expects('authenticate').yields()
      _people.expects('search').withArgs({
        searchFor: 'Fred Flintstone',
        communication: sub.Email
      }).yields(null, {
        results: {
          '@count': '0'
        }
      })
      _f1reg.expects('ensureCreated').withArgs(sub).yields('ERROR')

      f1reg.register(sub, function(err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('creates a new person record when no matches are found', function(done) {
      _f1reg.expects('validateReg').yields(null, sub)
      _f1.expects('authenticate').yields()
      _people.expects('search').withArgs({
        searchFor: 'Fred Flintstone',
        communication: sub.Email
      }).yields(null, {
        results: {
          '@count': '0'
        }
      })
      _f1reg.expects('ensureCreated').yields(sub, {})

      f1reg.register(sub, function(err) {
        verifyAll()
        done()
      })
    })
  })

  describe('ensureCreated', function() {
    it('creates new person record when person is null', function(done) {
      _f1reg.expects('createPerson').yields(null, {
        person: person
      })

      f1reg.ensureCreated(sub, null, function(err, reg, person) {
        reg.should.eql(sub)

        verifyAll()
        done()
      })
    })

    it('passes arguments through when person exists', function(done) {
      var p = {
        'name': 'Fred'
      }

      f1reg.ensureCreated(sub, p, function(err, reg, person) {
        reg.should.eql(sub)
        person.should.eql(p)
        verifyAll()
        done()
      })
    })
  })

  describe('createPerson', function() {
    var ADDR_OPTIONAL_FIELDS = [
      '@id',
      '@uri',
      'address3',
      'county',
      'carrierRoute',
      'deliveryPoint',
      'addressDate',
      'addressComment',
      'uspsVerified',
      'addressVerifiedDate',
      'lastVerificationAttemptDate',
      'createdDate',
      'lastUpdatedDate'
    ]

    var comms, _comms, addrs, _addrs, addrTypes, _addrTypes
    beforeEach(function() {
      comms = new F1.PersonCommunications(f1, person['@id'])
      _comms = sinon.mock(comms)
      addrTypes = new F1.AddressTypes(f1)
      _addrTypes = sinon.mock(addrTypes)
      addrs = new F1.PersonAddresses(f1, person['@id'])
      _addrs = sinon.mock(addrs)
    })

    afterEach(function() {
      _comms.restore()
      _addrTypes.restore()
      _addrs.restore()
    })

    function verifyAll() {
      _f1.verify()
      _people.verify()
      _f1reg.verify()
      _households.verify()
      _statuses.verify()
      _F1.verify()
      _communicationTypes.verify()
      _comms.verify()
      _addrTypes.verify()
      _addrs.verify()
    }

    it('yields error when status listing fails', function(done) {
      _statuses.expects('list').yields('error')

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })
    it('yields error when status listing missing desired new status', function(done) {
      _statuses.expects('list').yields(null, [{
        name: 'foo'
      }])

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('No Status named `New from Website` could be found!')

        verifyAll()
        done()
      })
    })
    it('yields error when household creation fails', function(done) {
      _statuses.expects('list').yields(null, [{
        name: 'New from Website'
      }])
      _households.expects('create').yields('error')

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields error when person creation fails', function(done) {
      _statuses.expects('list').yields(null, [status])

      _households.expects('create').withArgs(
          _.omit(household, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']))
        .yields(null, {
          household: household
        })
      _people.expects('create')
        .withArgs(_.omit(person, ['@id', '@uri'])).yields('error')

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields error when comm type listing fails', function(done) {
      _statuses.expects('list').yields(null, [status])

      _households.expects('create').withArgs(
          _.omit(household, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']))
        .yields(null, {
          household: household
        })
      _people.expects('create')
        .withArgs(_.omit(person, ['@id', '@uri'])).yields(null, {
          person: person
        })
      _communicationTypes.expects('list').yields('error')

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })
    it('yields error when comm type listing missing desired new comm type', function(done) {
      _statuses.expects('list').yields(null, [status])

      _households.expects('create').withArgs(
          _.omit(household, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']))
        .yields(null, {
          household: household
        })
      _people.expects('create')
        .withArgs(_.omit(person, ['@id', '@uri'])).yields(null, {
          person: person
        })
      _communicationTypes.expects('list').yields(null, [{
        name: 'foo'
      }])

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('No CommunicationType named `Email` could be found!')

        verifyAll()
        done()
      })
    })

    it('yields error when email creation fails', function(done) {

      _statuses.expects('list').yields(null, [status])

      _households.expects('create').withArgs(
          _.omit(household, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']))
        .yields(null, {
          household: household
        })
      _people.expects('create')
        .withArgs(_.omit(person, ['@id', '@uri'])).yields(null, {
          person: person
        })
      _communicationTypes.expects('list').yields(null, [emailCommType])
      _F1.expects('PersonCommunications').withArgs(f1, person['@id']).returns(comms)
      _comms.expects('create').withArgs(
        _.omit(emailComm, ['@id', '@uri', 'createdDate', 'lastUpdatedDate'])
      ).yields('error')

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields error when address type listing fails', function(done) {
      _statuses.expects('list').yields(null, [status])

      _households.expects('create').withArgs(
          _.omit(household, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']))
        .yields(null, {
          household: household
        })
      _people.expects('create')
        .withArgs(_.omit(person, ['@id', '@uri'])).yields(null, {
          person: person
        })
      _communicationTypes.expects('list').yields(null, [emailCommType])
      _F1.expects('PersonCommunications').withArgs(f1, person['@id']).returns(comms)
      _comms.expects('create').withArgs(
        _.omit(emailComm, ['@id', '@uri', 'createdDate', 'lastUpdatedDate'])
      ).yields(null, emailComm)
      _F1.expects('AddressTypes').withArgs(f1).returns(addrTypes)
      _addrTypes.expects('list').yields('error')

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields error when address type listing missing desired new address type', function(done) {
      _statuses.expects('list').yields(null, [status])

      _households.expects('create').withArgs(
          _.omit(household, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']))
        .yields(null, {
          household: household
        })
      _people.expects('create')
        .withArgs(_.omit(person, ['@id', '@uri'])).yields(null, {
          person: person
        })
      _communicationTypes.expects('list').yields(null, [emailCommType])
      _F1.expects('PersonCommunications').withArgs(f1, person['@id']).returns(comms)
      _comms.expects('create').withArgs(
        _.omit(emailComm, ['@id', '@uri', 'createdDate', 'lastUpdatedDate'])
      ).yields(null, emailComm)
      _F1.expects('AddressTypes').withArgs(f1).returns(addrTypes)
      _addrTypes.expects('list').yields(null, [{
        name: 'foo'
      }])

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('No AddressType named `Primary` could be found!')

        verifyAll()
        done()
      })
    })

    it('yields error when address creation fails', function(done) {
      _statuses.expects('list').yields(null, [status])

      _households.expects('create').withArgs(
          _.omit(household, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']))
        .yields(null, {
          household: household
        })
      _people.expects('create')
        .withArgs(_.omit(person, ['@id', '@uri'])).yields(null, {
          person: person
        })
      _communicationTypes.expects('list').yields(null, [emailCommType])
      _F1.expects('PersonCommunications').withArgs(f1, person['@id']).returns(comms)
      _comms.expects('create').withArgs(
        _.omit(emailComm, ['@id', '@uri', 'createdDate', 'lastUpdatedDate'])
      ).yields(null, emailComm)
      _F1.expects('AddressTypes').withArgs(f1).returns(addrTypes)
      _addrTypes.expects('list').yields(null, [addressType])
      _F1.expects('PersonAddresses').withArgs(f1, person['@id']).returns(addrs)
      _addrs.expects('create').withArgs(
        _.omit(address, ADDR_OPTIONAL_FIELDS)
      ).yields('error')

      f1reg.createPerson(sub, function(err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields newly-created person', function(done) {
      _statuses.expects('list').yields(null, [status])
      _households.expects('create').withArgs(
          _.omit(household, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']))
        .yields(null, {
          household: household
        })
      _people.expects('create').withArgs(_.omit(person, ['@id', '@uri'])).yields(null, {
        person: person
      })
      _communicationTypes.expects('list').yields(null, [emailCommType])
      _F1.expects('PersonCommunications').withArgs(f1, person['@id']).returns(comms)
      _comms.expects('create').withArgs(
        _.omit(emailComm, ['@id', '@uri', 'createdDate', 'lastUpdatedDate'])
      ).yields(null, emailComm)

      f1reg.createPerson(sub, function(err, result) {
        should(err).not.exist
        result.should.eql({
          person: person
        })

        verifyAll()
        done()
      })
    })
  })
})
