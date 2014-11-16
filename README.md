# f1foo

An integration between Wufoo's WebHooks and Fellowship One's REST API.

## Configuration

To use this you'll need to configure your Fellowship One credentials either in
a file named `f1config.json` in the root of this package, or in the `F1_CONFIG`
environment variable.

The format is a JSON string like this:

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
