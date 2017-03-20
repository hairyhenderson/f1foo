var should = require('should')
var WufooTranslator = require('../lib/WufooTranslator')

describe('WufooTranslator', function () {
  var wt

  beforeEach(function () {
    wt = new WufooTranslator()
  })

  describe('translate', function () {
    it('requires FieldStructure', function (done) {
      wt.translate({}, function (err, sub) {
        should.exist(err)
        done()
      })
    })
    it('requires FieldStructure to be a string', function (done) {
      wt.translate({
        FieldStructure: []
      }, function (err, sub) {
        should.exist(err)
        done()
      })
    })
    it('requires FieldStrucutre to be a JSON string', function (done) {
      wt.translate({
        FieldStructure: 'foo'
      }, function (err, sub) {
        should.exist(err)
        done()
      })
    })

    it('returns empty object given no fields', function (done) {
      wt.translate({
        FieldStructure: '{ "Fields": [] }'
      }, function (err, sub) {
        should.not.exist(err)
        sub.should.eql({})
        done()
      })
    })

    it('returns object with proper field names', function (done) {
      wt.translate({
        Field1: 'Fred',
        FieldStructure: JSON.stringify({
          Fields: [{
            Title: 'Name',
            ID: 'Field1'
          }]
        })
      }, function (err, sub) {
        should.not.exist(err)
        sub.should.eql({
          Name: 'Fred'
        })
        done()
      })
    })

    it('can handle objects with subfields', function (done) {
      wt.translate({
        FieldStructure: JSON.stringify({
          Fields: [{
            'Title': 'Name',
            'Instructions': '',
            'IsRequired': '0',
            'ClassNames': '',
            'DefaultVal': '',
            'Page': '1',
            'SubFields': [{
              'DefaultVal': '',
              'ID': 'Field106',
              'Label': 'First'
            }, {
              'DefaultVal': '',
              'ID': 'Field107',
              'Label': 'Last'
            }],
            'Type': 'shortname',
            'ID': 'Field106'
          }, {
            'Title': 'Email',
            'Instructions': '',
            'IsRequired': '0',
            'ClassNames': '',
            'DefaultVal': '',
            'Page': '1',
            'Type': 'email',
            'ID': 'Field114'
          }, {
            'Title': 'Address',
            'Instructions': '',
            'IsRequired': '0',
            'ClassNames': '',
            'DefaultVal': '',
            'Page': '1',
            'SubFields': [{
              'DefaultVal': '',
              'ID': 'Field108',
              'Label': 'Street Address'
            }, {
              'DefaultVal': '',
              'ID': 'Field109',
              'Label': 'Address Line 2'
            }, {
              'DefaultVal': '',
              'ID': 'Field110',
              'Label': 'City'
            }, {
              'DefaultVal': '',
              'ID': 'Field111',
              'Label': 'State / Province / Region'
            }, {
              'DefaultVal': '',
              'ID': 'Field112',
              'Label': 'Postal / Zip Code'
            }, {
              'DefaultVal': '',
              'ID': 'Field113',
              'Label': 'Country'
            }],
            'Type': 'address',
            'ID': 'Field108'
          }, {
            Title: 'Home Phone',
            Instructions: '',
            IsRequired: '0',
            ClassNames: 'leftHalf',
            DefaultVal: '',
            Page: '1',
            Type: 'phone',
            ID: 'Field4'
          }, {
            Title: 'Mobile Phone',
            Instructions: '',
            IsRequired: '0',
            ClassNames: 'rightHalf',
            DefaultVal: '',
            Page: '1',
            Type: 'phone',
            ID: 'Field5'
          }]
        }),
        FormStructure: JSON.stringify({
          'Name': 'Test form',
          'Description': "This is my form. Please fill it out. It's awesome!",
          'RedirectMessage': 'Great! Thanks for filling out my form!',
          'Url ': 'test-form',
          'Email': null,
          'IsPublic': '1',
          'Language': 'english',
          'StartDate': '2000-01-01 12:00:00',
          'EndDate': '2030-01-01 12:00:00',
          'EntryLimit': '0',
          'DateCreated': '2014-11-22 10:58:17',
          'DateUpdated': '2014-12-03 17:51:07',
          'Hash': '0123456789abcd'
        }),
        Field106: 'Fred',
        Field107: 'Flinstone',
        Field114: 'fred@flinstone.com',
        Field108: '301 Cobblestone Way',
        Field109: '',
        Field110: 'Bedrock',
        Field111: 'South Dakota',
        Field112: '12345',
        Field113: 'United States',
        Field4: '555-555-1212',
        Field5: '543-210-1234',
        CreatedBy: 'public',
        DateCreated: '2014-12-03 18:07:46',
        EntryId: '6',
        IP: '127.0.0.1',
        HandshakeKey: ''
      }, function (err, sub) {
        should.not.exist(err)
        sub.should.eql({
          Name: {
            First: 'Fred',
            Last: 'Flinstone'
          },
          Email: 'fred@flinstone.com',
          Address: {
            'Street Address': '301 Cobblestone Way',
            'Address Line 2': '',
            'City': 'Bedrock',
            'State / Province / Region': 'South Dakota',
            'Postal / Zip Code': '12345',
            'Country': 'United States'
          },
          'Home Phone': '555-555-1212',
          'Mobile Phone': '543-210-1234',
          metadata: {
            CreatedBy: 'public',
            DateCreated: '2014-12-03 18:07:46',
            EntryId: '6',
            IP: '127.0.0.1',
            HandshakeKey: ''
          }
        })
        done()
      })
    })
  })
})
