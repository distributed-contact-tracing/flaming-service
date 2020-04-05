# :fire: flaming-server [![Build Status](https://travis-ci.org/distributed-contact-tracing/flaming-service.svg?branch=master)](https://travis-ci.org/distributed-contact-tracing/flaming-service)

Firebase backend for Distributed Contact Tracing

## Install and emulate locally

Needs Node 10 to work.

```
yarn

firebase emulators:start
```

## Collections

### contactEvents

Collection for contact events from people who've got infected.

#### Document Structure

```js
{
  token: string,      // Id from Bluetooth handshake
}
```

#### Permissions

| Get       | Create                                                                 | Update   | Delete   |
| --------- | ---------------------------------------------------------------------- | -------- | -------- |
| All users | Users with an document in dataAuthorizations, i.e. confirmed infection | _Nobody_ | _Nobody_ |

### dataAuthorizations

Authorizations of users that are allowed to share their data in the network. Issues by licensed healthcare practitioners.

#### Document Structure

```js
{
  _id: string                 // App ID of infected user
  bankIdCompletionData: {
    cert: {
      notAfter: string,       // End of BankID validity, Unix ms
      notBefore: string,      // Start of BankID validity, Unix ms
    },
    device: {
      ipAddress: string       // IP address of the user agent
    },
    ocspResponse: string,     // Base64-encoded signned OCSP response
    signature: string,        // Base64-encoded XML signature
    user: {
      givenName: string,
      name: string,
      personalNumber: string,
      surname: string,
    },
  },
  type: 'hcp'                 // Healthcare practicer
}
```

#### Permissions

| Get      | Create   | Update   | Delete   |
| -------- | -------- | -------- | -------- |
| _Nobody_ | _Nobody_ | _Nobody_ | _Nobody_ |

### hcps

Licensed healthcare practitioners.

#### Document Structure

```js
{
  _id: string,
  personalNumberHash: string  // SHA-3-512 encoded
}
```

#### Permissions

| Get      | Create   | Update   | Delete   |
| -------- | -------- | -------- | -------- |
| _Nobody_ | _Nobody_ | _Nobody_ | _Nobody_ |
