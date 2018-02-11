# dispatch-recursive [![Build Status](https://travis-ci.org/CascadeEnergy/dispatch-recursive.svg?branch=master)](https://travis-ci.org/CascadeEnergy/dispatch-recursive)

> Recursive command dispatch.

## Install

```
$ npm install --save dispatch-recursive
```

## What is Dispatch?

This module provides a way to construct a function which loops through a list of "command" functions, and calls
each with a "target" value until one of the commands returns a value other than `undefined`.
The command functions are polymorphic and adhere to the same interface. The point of dispatch
is to simplify delegating to concrete command implementations.

The reason this is called "recursive dispatch" is because the contract of each command function is
`(target, fn)` where `fn` is the function returned by dispatch. This allows each command to apply the dispatch
chain to sub properties of the target.

There is also a similar module for performing dispatch non recursively, which forwards all arguments given to the
resultant function to be forwarded to each command called [dispatch-fn](https://github.com/CascadeEnergy/dispatch-fn).

In addition, we can exploit the contract of dispatch commands to compose a terminating 
function that provides some default behavior by always returning a value or one that always
throws an exception.

This pattern is sometimes also referred to as *Chain of Command*

Implementation of this module was heavily inspired by Chapter 5 of
*Functional Javascript: Introducing Functional Programming with Underscore.js* by Michael Fogus.  
Published by O'reilly Media (2013-06-01)  
[Book Source - Chapter 5](https://github.com/funjs/book-source/blob/master/chapter05.js)

## Usage

This example shows how you could use dispatch to construct a `rev` function. The behavior of `rev`
changes depending on what type of object it is given.

```javascript
'use strict';

var isArray = require('lodash/lang/isArray');
var isPlainObject = require('lodash/lang/isPlainObject');
var isString = require('lodash/lang/isString');
var mapValues = require('lodash/object/mapValues');
var dispatch = require('../es5');

var rev = dispatch(
  reverseString,
  reverseArray,
  reverseObjectProperties,
  irreversible
);

function reverseString(target) {
  if (isString(target)) {
    return target.split('').reverse().join('');
  }

  return undefined;
}

function reverseArray(target, rev) {
  // Recursion!!!
  // Reverses each member of the array, and then reverses the whole array.
  if (isArray(target)) {
    return target.map(rev).reverse();
  }

  return undefined;
}

function reverseObjectProperties(target, rev) {
  // Recursion!!!
  // Original rev function is used to transform the next layer
  // of object properties.
  if (isPlainObject(target)) {
    return mapValues(target, rev);
  }

  return undefined;
}

// If the target hasn't been caught by any rev commands
// it will fall through to this function which does nothing
// but return the original value passed in.
// This is us exploiting the command interface to provide default
// fall through behavior in the dispatch chain.
function irreversible(target) {
  return target;
}

console.log(rev(42)); // 42

console.log(rev('abc')); // 'cba'

console.log(rev(['a', 'b', 'c'])); // [ 'c', 'b', 'a' ]

console.log(rev([['c', 'b', 'a'], 'oof', 32, null, {foo: 'rab'}]));
// [ { foo: 'bar' }, null, 32, 'foo', [ 'a', 'b', 'c' ] ]

console.log(
  rev(
    {
      beep: ['p', 'o', 'o', 'b'],
      nested: {
        nope: null,
        abc: 'cba',
        abcArr: ['c', 'b', 'a']
      },
      missed: 0
    }
  )
);
//{
//  beep: [ 'b', 'o', 'o', 'p' ],
//  nested: {
//    nope: null,
//    abc: 'abc',
//    abcArr: [ 'a', 'b', 'c' ]
//  },
//  missed: 0
//}
```
