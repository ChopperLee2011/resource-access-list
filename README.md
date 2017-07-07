# resource-access-list

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][download-badge]][npm-url]
[![Code Style][standard-image]][standard-url]

A simple Loopback ACL middleware with one rule file, also support limited dynamic role supported which base on Loopback model relation method

Inspired by the following libraries/examples:
 - https://github.com/SwiftBlue/simple-express-acl
 
## Install

```sh
npm i -S resource-access-list
```

## Usage

```js
const path = require('path')
const Ral = require('resource-access-list')

module.exports = () => {
  const ral = new Ral()
  ral.superRoles = ['admin']
  ral.notAllowStatusCode = 403
  ral.setRules(path.join(__dirname, '../rules'))
  return ral.check
}


```


## Dynamic Role
    - for invoke $owner role, need adding 'owner' relationship in the model.json
    - for invoke $memeber role, need adding 'member' relationship in the mdoel.json
    
## License

MIT © [chopperlee]

[npm-url]: https://npmjs.org/package/resource-access-list
[npm-image]: https://img.shields.io/npm/v/resource-access-list.svg?style=flat-square

[travis-url]: https://travis-ci.org/ChopperLee2011/resource-access-list
[travis-image]: https://img.shields.io/travis/ChopperLee2011/resource-access-list.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/resource-access-list.svg?style=flat-square

[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com