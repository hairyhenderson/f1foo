var should = require('should')
var sinon = require('sinon')
var _ = require('lodash')
var F1Register = require('../lib/F1Register')
var F1 = require('fellowshipone')

describe('F1Register', function () {
  var f1reg, _f1, f1, people, _people, _f1reg, _F1

  beforeEach(function () {
    f1 = new F1({
      'username': 'foo',
      'password': 'bar',
      'apiURL': 'http://localhost',
      'oauth_credentials': {
        'consumer_key': '1',
        'consumer_secret': '1'
      }
    })
    people = new F1.People(f1)
    _F1 = sinon.mock(F1)
    _f1 = sinon.mock(f1)
    _people = sinon.mock(people)
    f1reg = new F1Register(f1, people)
    _f1reg = sinon.mock(f1reg)
  })

  function verifyAll () {
    _f1.verify()
    _people.verify()
    _f1reg.verify()
    _F1.verify()
  }

  afterEach(function () {
    _f1.restore()
    _people.restore()
    _f1reg.restore()
    _F1.restore()
  })

  var sub, status, household, person, emailComm, emailCommType, addressType, address, hPhoneComm, hPhoneCommType, mPhoneComm, mPhoneCommType
  beforeEach(function () {
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
      },
      'Home Phone': '555-555-1212',
      'Mobile Phone': '543-210-1234'
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
      preferred: 'true',
      createdDate: '2015-01-01T00:00:00',
      lastUpdatedDate: '2015-01-01T00:00:00'
    }
    hPhoneCommType = {
      '@id': '1',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Communications/CommunicationTypes/1',
      '@generalType': 'Telephone',
      name: 'Home Phone'
    }
    hPhoneComm = {
      '@id': '1234567',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Communications/1234567',
      person: _.pick(person, ['@id', '@uri']),
      communicationType: hPhoneCommType,
      communicationGeneralType: 'Telephone',
      communicationValue: sub['Home Phone'],
      searchCommunicationValue: sub['Home Phone'],
      preferred: 'true',
      createdDate: '2015-01-01T00:00:00',
      lastUpdatedDate: '2015-01-01T00:00:00'
    }
    mPhoneCommType = {
      '@id': '1',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Communications/CommunicationTypes/1',
      '@generalType': 'Telephone',
      name: 'Mobile Phone'
    }
    mPhoneComm = {
      '@id': '1234566',
      '@uri': 'https://dc.staging.fellowshiponeapi.com/v1/Communications/1234566',
      person: _.pick(person, ['@id', '@uri']),
      communicationType: mPhoneCommType,
      communicationGeneralType: 'Telephone',
      communicationValue: sub['Mobile Phone'],
      searchCommunicationValue: sub['Mobile Phone'],
      preferred: 'true',
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

  describe('searchQuery', function () {
    it('yields query based on valid registration object', function (done) {
      f1reg.searchQuery(sub, function (err, query) {
        should(err).not.exist
        query.should.eql({
          searchFor: 'Fred Flintstone',
          communication: 'fred@flintstone.com'
        })

        verifyAll()
        done()
      })
    })
  })

  describe('validateReg', function () {
    it('requires Name', function (done) {
      delete sub.Name

      f1reg.validateReg(sub, function (err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
    it('requires Name.First', function (done) {
      delete sub.Name.First

      f1reg.validateReg(sub, function (err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
    it('requires Name.Last', function (done) {
      delete sub.Name.Last

      f1reg.validateReg(sub, function (err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
    it('requires Email', function (done) {
      delete sub.Email

      f1reg.validateReg(sub, function (err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })
    it('sets statusCode to 400', function (done) {
      delete sub.Email

      f1reg.validateReg(sub, function (err) {
        err.statusCode.should.eql(400)
        verifyAll()
        done()
      })
    })
    it('sets message', function (done) {
      delete sub.Email

      f1reg.validateReg(sub, function (err) {
        err.message.should.not.be.empty
        verifyAll()
        done()
      })
    })
  })

  describe('register', function () {
    it('yields error given authentication failure', function (done) {
      _f1.expects('authenticate').yields('ERROR')

      f1reg.register({
        Name: {}
      }, function (err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('yields error given validation failure', function (done) {
      _f1.expects('authenticate').yields()
      _f1reg.expects('validateReg').yields('error')

      f1reg.register({}, function (err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('yields error given people search error', function (done) {
      var query = {
        searchFor: 'Fred Flintstone',
        communication: sub.Email
      }

      _f1.expects('authenticate').yields()
      _f1reg.expects('validateReg').yields(null, sub)
      _f1reg.expects('searchQuery').withArgs(sub).yields(null, query)
      _people.expects('search').withArgs(query).yields('ERROR')

      f1reg.register(sub, function (err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('yields error when more than one person record is found', function (done) {
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

      f1reg.register(sub, function (err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it("yields error when can't ensure the person exists", function (done) {
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

      f1reg.register(sub, function (err) {
        err.should.not.be.empty
        verifyAll()
        done()
      })
    })

    it('creates a new person record when no matches are found', function (done) {
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

      f1reg.register(sub, function (err) {
        should(err).not.exist

        verifyAll()
        done()
      })
    })
  })

  describe('ensureCreated', function () {
    it('yields error when person creation fails', function (done) {
      _f1reg.expects('createPersonRecord').yields('error')

      f1reg.ensureCreated(sub, null, function (err, reg, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('creates new person record when person is null', function (done) {
      _f1reg.expects('createPersonRecord').yields(null, {
        person: person
      })

      f1reg.ensureCreated(sub, null, function (err, reg, person) {
        should(err).not.exist
        reg.should.eql(sub)

        verifyAll()
        done()
      })
    })

    it('passes arguments through when person exists', function (done) {
      var p = {
        'name': 'Fred'
      }

      f1reg.ensureCreated(sub, p, function (err, reg, person) {
        should(err).not.exist
        reg.should.eql(sub)
        person.should.eql(p)
        verifyAll()
        done()
      })
    })
  })

  describe('createPersonRecord', function () {
    var comms, _comms, addrs, _addrs, addrTypes, _addrTypes
    beforeEach(function () {
      comms = new F1.PersonCommunications(f1, person['@id'])
      _comms = sinon.mock(comms)
      addrTypes = new F1.AddressTypes(f1)
      _addrTypes = sinon.mock(addrTypes)
      addrs = new F1.PersonAddresses(f1, person['@id'])
      _addrs = sinon.mock(addrs)
    })

    afterEach(function () {
      _comms.restore()
      _addrTypes.restore()
      _addrs.restore()
    })

    function verifyAll () {
      _f1.verify()
      _people.verify()
      _f1reg.verify()
      _F1.verify()
      _comms.verify()
      _addrTypes.verify()
      _addrs.verify()
    }

    it('yields error when status listing fails', function (done) {
      _f1reg.expects('getStatus').yields('error')

      f1reg.createPersonRecord(sub, function (err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields error when household creation fails', function (done) {
      _f1reg.expects('getStatus').yields(null, status)
      _f1reg.expects('createHousehold').yields('error')

      f1reg.createPersonRecord(sub, function (err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields error when person creation fails', function (done) {
      _f1reg.expects('getStatus').yields(null, status)
      _f1reg.expects('createHousehold').withArgs(sub).yields(null, {
        household: household
      })
      _f1reg.expects('createPerson').withArgs(household['@id'], status, sub).yields('error')

      f1reg.createPersonRecord(sub, function (err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields error when email creation fails', function (done) {
      _f1reg.expects('getStatus').yields(null, status)
      _f1reg.expects('createHousehold').yields(null, {
        household: household
      })
      _f1reg.expects('createPerson').withArgs(household['@id'], status, sub).yields(null, {
        person: person
      })
      _f1reg.expects('createEmail').withArgs(person, sub).yields('error')

      f1reg.createPersonRecord(sub, function (err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields error when address creation fails', function (done) {
      _f1reg.expects('getStatus').yields(null, status)
      _f1reg.expects('createHousehold').yields(null, {
        household: household
      })
      _f1reg.expects('createPerson').withArgs(household['@id'], status, sub).yields(null, {
        person: person
      })
      _f1reg.expects('createEmail').withArgs(person, sub).yields(null, {
        communication: emailComm
      })
      _f1reg.expects('createAddress').withArgs(person, sub).yields('error')

      f1reg.createPersonRecord(sub, function (err, person) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields newly-created person', function (done) {
      _f1reg.expects('getStatus').withArgs('New from Website').yields(null, status)
      _f1reg.expects('createHousehold').yields(null, {
        household: household
      })
      _f1reg.expects('createPerson').withArgs(household['@id'], status, sub).yields(null, {
        person: person
      })
      _f1reg.expects('createEmail').withArgs(person, sub).yields(null, {
        communication: emailComm
      })
      _f1reg.expects('createAddress').withArgs(person, sub).yields(null, address)

      f1reg.createPersonRecord(sub, function (err, result) {
        should(err).not.exist
        result.should.eql({
          person: person
        })

        verifyAll()
        done()
      })
    })
  })

  describe('getResourceByName', function () {
    var addrTypes, _addrTypes
    beforeEach(function () {
      addrTypes = new F1.AddressTypes(f1)
      _addrTypes = sinon.mock(addrTypes)
    })

    afterEach(function () {
      _addrTypes.restore()
    })

    function verifyAll () {
      _f1reg.verify()
      _F1.verify()
      _addrTypes.verify()
    }

    it('yields error when list API fails', function (done) {
      _F1.expects('AddressTypes').withArgs(f1).returns(addrTypes)
      _addrTypes.expects('list').yields('error')

      f1reg.getResourceByName('AddressTypes', 'foo', function (err, addrType) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('yields error when list missing desired type', function (done) {
      _F1.expects('AddressTypes').withArgs(f1).returns(addrTypes)
      _addrTypes.expects('list').yields(null, [{
        name: 'bar'
      }, {
        name: 'baz'
      }])

      f1reg.getResourceByName('AddressTypes', 'foo', function (err, addrType) {
        err.should.eql('No AddressTypes with name `foo` could be found!')

        verifyAll()
        done()
      })
    })

    it('yields desired resource', function (done) {
      _F1.expects('AddressTypes').withArgs(f1).returns(addrTypes)
      _addrTypes.expects('list').yields(null, [{
        name: 'foo'
      }])

      f1reg.getResourceByName('AddressTypes', 'foo', function (err, addrType) {
        should(err).not.exist
        addrType.should.eql({
          name: 'foo'
        })

        verifyAll()
        done()
      })
    })
  })

  describe('getStatus', function () {
    it('delegates to getResourceByName', function (done) {
      _f1reg.expects('getResourceByName').withArgs('Statuses', 'name', 'callback')
      f1reg.getStatus('name', 'callback')

      verifyAll()
      done()
    })
  })

  describe('getAddressType', function () {
    it('delegates to getResourceByName', function (done) {
      _f1reg.expects('getResourceByName').withArgs('AddressTypes', 'name', 'callback')
      f1reg.getAddressType('name', 'callback')

      verifyAll()
      done()
    })
  })

  describe('getCommunicationType', function () {
    it('delegates to getResourceByName', function (done) {
      _f1reg.expects('getResourceByName').withArgs('CommunicationTypes', 'name', 'callback')
      f1reg.getCommunicationType('name', 'callback')

      verifyAll()
      done()
    })
  })

  describe('createAddress', function () {
    var addrs, _addrs
    beforeEach(function () {
      addrs = new F1.PersonAddresses(f1, person['@id'])
      _addrs = sinon.mock(addrs)
    })

    afterEach(function () {
      _addrs.restore()
    })

    function verifyAll () {
      _f1.verify()
      _f1reg.verify()
      _F1.verify()
      _addrs.verify()
    }

    it('yields error when address type mapping fails', function (done) {
      _f1reg.expects('getAddressType').withArgs('Primary').yields('error')

      f1reg.createAddress(person, sub, function (err, address) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })
    it('yields newly-created address', function (done) {
      _f1reg.expects('getAddressType').withArgs('Primary').yields(null, addressType)
      _F1.expects('PersonAddresses').withArgs(f1, person['@id']).returns(addrs)
      _addrs.expects('create').yields(null, address)

      f1reg.createAddress(person, sub, function (err, address) {
        should(err).not.exist
        address.should.eql(address)

        verifyAll()
        done()
      })
    })
  })

  describe('createHousehold', function () {
    var hshld, _hshld
    beforeEach(function () {
      hshld = new F1.Households(f1)
      _hshld = sinon.mock(hshld)
    })

    afterEach(function () {
      _hshld.restore()
    })

    function verifyAll () {
      _f1.verify()
      _f1reg.verify()
      _F1.verify()
      _hshld.verify()
    }

    it('delegates to F1 API', function (done) {
      _F1.expects('Households').withArgs(f1).returns(hshld)
      _hshld.expects('create').withArgs(_.pick(household, [
        'householdName', 'householdSortName', 'householdFirstName'
      ]), 'callback')

      f1reg.createHousehold(sub, 'callback')
      verifyAll()
      done()
    })
  })

  describe('createPerson', function () {
    it('delegates to F1 API', function (done) {
      _F1.expects('People').withArgs(f1).returns(people)
      _people.expects('create').withArgs({
        status: 'status',
        '@householdID': 'hhid',
        firstName: 'Fred',
        lastName: 'Flintstone'
      }, 'callback')

      f1reg.createPerson('hhid', 'status', sub, 'callback')
      verifyAll()
      done()
    })
  })

  describe('createEmail', function () {
    var pcomms, _pcomms
    beforeEach(function () {
      pcomms = new F1.PersonCommunications(f1, person['@id'])
      _pcomms = sinon.mock(pcomms)
    })

    afterEach(function () {
      _pcomms.restore()
    })

    function verifyAll () {
      _f1.verify()
      _f1reg.verify()
      _F1.verify()
      _pcomms.verify()
    }

    it('yields error when comm type listing fails', function (done) {
      _f1reg.expects('getCommunicationType').yields('error')

      f1reg.createEmail(person, sub, function (err, response) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('delegates to F1 API', function (done) {
      _f1reg.expects('getCommunicationType').withArgs('Email').yields(null, emailCommType)
      _F1.expects('PersonCommunications').withArgs(f1, person['@id']).returns(pcomms)
      _pcomms.expects('create').withArgs(
        _.omit(emailComm, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']), 'callback')

      f1reg.createEmail(person, sub, 'callback')
      verifyAll()
      done()
    })
  })

  describe('createMobilePhone', function () {
    var pcomms, _pcomms
    beforeEach(function () {
      pcomms = new F1.PersonCommunications(f1, person['@id'])
      _pcomms = sinon.mock(pcomms)
    })

    afterEach(function () {
      _pcomms.restore()
    })

    function verifyAll () {
      _f1.verify()
      _f1reg.verify()
      _F1.verify()
      _pcomms.verify()
    }

    it('no-op when no Mobile Phone field in registration', function (done) {
      sub['Home Phone'] = ''

      f1reg.createHomePhone(person, sub, function (err, response) {
        should(err).not.exist

        verifyAll()
        done()
      })
    })

    it('yields error when comm type listing fails', function (done) {
      _f1reg.expects('getCommunicationType').yields('error')

      f1reg.createHomePhone(person, sub, function (err, response) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('delegates to F1 API', function (done) {
      _f1reg.expects('getCommunicationType').withArgs('Home Phone').yields(null, hPhoneCommType)
      _F1.expects('PersonCommunications').withArgs(f1, person['@id']).returns(pcomms)
      _pcomms.expects('create').withArgs(
        _.omit(hPhoneComm, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']), 'callback')

      f1reg.createHomePhone(person, sub, 'callback')
      verifyAll()
      done()
    })
  })

  describe('createMobilePhone', function () {
    var pcomms, _pcomms
    beforeEach(function () {
      pcomms = new F1.PersonCommunications(f1, person['@id'])
      _pcomms = sinon.mock(pcomms)
    })

    afterEach(function () {
      _pcomms.restore()
    })

    function verifyAll () {
      _f1.verify()
      _f1reg.verify()
      _F1.verify()
      _pcomms.verify()
    }

    it('no-op when no Mobile Phone field in registration', function (done) {
      sub['Mobile Phone'] = ''

      f1reg.createMobilePhone(person, sub, function (err, response) {
        should(err).not.exist

        verifyAll()
        done()
      })
    })

    it('yields error when comm type listing fails', function (done) {
      _f1reg.expects('getCommunicationType').yields('error')

      f1reg.createMobilePhone(person, sub, function (err, response) {
        err.should.eql('error')

        verifyAll()
        done()
      })
    })

    it('delegates to F1 API', function (done) {
      _f1reg.expects('getCommunicationType').withArgs('Mobile Phone').yields(null, mPhoneCommType)
      _F1.expects('PersonCommunications').withArgs(f1, person['@id']).returns(pcomms)
      _pcomms.expects('create').withArgs(
        _.omit(mPhoneComm, ['@id', '@uri', 'createdDate', 'lastUpdatedDate']), 'callback')

      f1reg.createMobilePhone(person, sub, 'callback')
      verifyAll()
      done()
    })
  })
})
