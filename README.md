[![Build Status][travis-image]][travis-url]
[![Code Coverage][coverage-image]][coverage-url]
[![Code Climate][climate-image]][climate-url]
[![Dependency Status][gemnasium-image]][gemnasium-url]
[![Current Version][npm-image]][npm-url]

# f1foo

An integration between Wufoo's WebHooks and Fellowship One's REST API.

It allows Wufoo to be used for event registration (and other) forms, while being
able to track registrations within Fellowship One.

## Features

- [x] Accepts POSTs from Wufoo webhooks, supports Handshake Key
- [ ] auto-matching for existing Person records
 - when there's more than 1 record which matches first/last/e-mail, either do nothing,
   or notify someone (by e-mail?)
- [ ] for non-existing Person records, either:
 - create a new record automatically from provided info, need to be able to (from the form, perhaps a hidden field) say whether the person is an event-only attendee or something else (newcomer? visitor? attendee?)
 - don't create a new record but notify someone by e-mail so they can optionally create a record manually for this person (?)

## Installation

This application is best used on a PaaS cloud provider like Heroku, Cloud Foundry,
IBM BlueMix, and others. It's also available as a Docker image. It's (mostly)
pre-configured for Heroku and IBM BlueMix, and it can of course also be used on
a self-hosted environment.

Start by writing your [configuration](#Configuration) into a JSON file and
saving it where you're going to install `f1foo`.

Then, follow the instructions relevant to your environment...

### Docker

See [the docker website](https://docker.com) to get started with Docker.

```
$ docker run \
  --detach \
  --publish 3000:3000 \
  --env F1_CONFIG='{ "apiURL": "...", ... }' \
  hairyhenderson/f1foo
```

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

_Optional._

When `WUFOO_HANDSHAKE_KEY` is set, f1foo will reject incoming posts that don't
have a matching handshake key.

### `DEBUG`

_Optional._

Controls the [debug](https://npmjs.org/package/debug) logs to aid with troubleshooting.
Try `DEBUG=f1foo` to see f1foo's debug logs, or `DEBUG=*` to see all debug logs.

## Usage

Once f1foo is [configured](#Configuration) and [running](#Installation), add
WebHook notifications to your forms.
See [these instructions](http://help.wufoo.com/articles/en_US/SurveyMonkeyArticleType/Webhooks).
The path on the URL should be `/hooks`, so if the app is running on Heroku,
the URL should be something like `https://f1foo.herokuapp.com/hooks`, and the
handshakeKey should be set (or not) to your `WUFOO_HANDSHAKE_KEY` value.

_Important:_ Wufoo must send the form metadata along with each POST. In the Wufoo
UI, this is
- [x] Include Field and Form Structures with Entry Data

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

Copyright (c) 2014-2015 Dave Henderson

[travis-image]: https://img.shields.io/travis/hairyhenderson/f1foo.svg?style=flat
[travis-url]: https://travis-ci.org/hairyhenderson/f1foo

[coverage-image]: https://img.shields.io/codeclimate/coverage/github/hairyhenderson/f1foo.svg?style=flat
[coverage-url]: https://codeclimate.com/github/hairyhenderson/f1foo

[climate-image]: https://img.shields.io/codeclimate/github/hairyhenderson/f1foo.svg?style=flat
[climate-url]: https://codeclimate.com/github/hairyhenderson/f1foo

[gemnasium-image]: https://img.shields.io/gemnasium/hairyhenderson/f1foo.svg?style=flat
[gemnasium-url]: https://gemnasium.com/hairyhenderson/f1foo

[npm-image]: https://img.shields.io/npm/v/f1foo.svg?style=flat
[npm-url]: https://npmjs.org/package/f1foo
