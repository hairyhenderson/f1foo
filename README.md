# f1foo

An integration between Wufoo's WebHooks and Fellowship One's REST API.

It allows Wufoo to be used for event registration (and other) forms, while being
able to track registrations within Fellowship One.

## Features

- Accepts

### planned features...

I haven't yet had time to implement these:

- auto-matching for existing Person records
- for non-existing Person records, either:
 - create a new record automatically from provided info, need to be able to (from the form, perhaps a hidden field) say whether the person is an event-only attendee or something else (newcomer? visitor? attendee?)
 - don't create a new record but notify someone by e-mail so they can optionally create a record manually for this person (?)

## Installation

This application is best used on a PaaS cloud provider like Heroku, Cloud Foundry,
IBM BlueMix, and others. It's (mostly) pre-configured for Heroku and IBM BlueMix,
and it can of course also be used on a self-hosted environment.

Start by writing your [configuration](#Configuration) into a JSON file and
saving it where you're going to install `f1foo`.

Then, follow the instructions relevant to your environment...

### Heroku

Assuming you already have a [Heroku account](https://signup.heroku.com/dc) and
the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed, all you should
need to do is:

```
$ npm install f1foo
$ cd node_modules/f1foo
$ git init
$ heroku apps:create APP_NAME
$ heroku git:remote -a APP_NAME
$ heroku config:set F1_CONFIG="`cat ../../f1config.json`"
$ git add .
$ git commit -am "Initial commit"
$ git push heroku master
```

At this point, the URL to your new app will be printed out - something like
`https://APP_NAME.herokuapp.com`

### Self-hosted

```
$ npm install f1foo
$ cd node_modules/f1foo
$ npm start
```

The app is now running at http://localhost:3000/.

## Configuration

All configuration is done through environment variables.

### `F1_CONFIG`

_Required._

An environment variable `F1_CONFIG` must be set with your Fellowship One
credentials. It's a JSON string like this:

```json
{
  "apiURL": "https://churchcode.staging.fellowshiponeapi.com/v1",
  "username": "Me",
  "password": "reallysecurepassword",
  "oauth_credentials": {
    "consumer_key": "111",
    "consumer_secret": "12345678-9abc-defe-dcba-987654321012"
  }
}
```

___Note:___ For testing you probably should use the staging API URL, but make sure
to use your production API URL for production.

### `WUFOO_HANDSHAKE_KEY`

## Usage

Simply point

## Contributions

Pull Requests are more than welcome!

## Tests

To run the unit tests:

```
$ npm install --dev
$ make test
```

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014 Dave Henderson
