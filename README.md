# resource-access-list

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

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

resourceAccessList() // true
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