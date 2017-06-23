# resource-access-list

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]
[![Code Style][standard-image][standard-url]]

An ACL middleware for Loopback APP, with limit dynamic role supported.

Inspired by the following libraries/examples:
 - https://github.com/SwiftBlue/simple-express-acl
 
## Install

```sh
npm i -S resource-access-list
```

## Usage

```js
import resourceAccessList from "resource-access-list"

resource-access-list() // true
```


## Dynamic Role
    - for invoke $owner role, need adding 'owner' relationship in the model.json
    - for invoke $memeber role, need adding 'member' relationship in the mdoel.json
    
## License

MIT © [chopperlee]

[npm-url]: https://npmjs.org/package/resource-access-list
[npm-image]: https://img.shields.io/npm/v/resource-access-list.svg?style=flat-square

[travis-url]: https://travis-ci.org/chopperlee/resource-access-list
[travis-image]: https://img.shields.io/travis/chopperlee/resource-access-list.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/chopperlee/resource-access-list
[coveralls-image]: https://img.shields.io/coveralls/chopperlee/resource-access-list.svg?style=flat-square

[depstat-url]: https://david-dm.org/chopperlee/resource-access-list
[depstat-image]: https://david-dm.org/chopperlee/resource-access-list.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/resource-access-list.svg?style=flat-square

[standard]: https://img.shields.io/badge/code_style-standard-brightgreen.svg