'use strict';

var isArray = require('lodash/isArray');
var isPlainObject = require('lodash/isPlainObject');
var isString = require('lodash/isString');
var mapValues = require('lodash/mapValues');
var dispatch = require('..');

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

