'use strict';

/**
 * Recursive dispatch, returns a function which iterates a series of commands
 * looking for one to handle the target and return a value. The commands adhere
 * to an interface of (target, fn) where the returned dispatch fn is passed
 * along to each command, where it can be used by the command. If the target
 * cannot be handled by a command the command returns undefined. If none of the
 * supplied commands handle the target, an error is thrown.
 *
 * @param commands
 * @returns {Function}
 */

module.exports = function dispatch() {
  var commands = Array.prototype.slice.call(arguments);

  return function fn(target) {
    var result;

    for (var j = 0; j < commands.length; j += 1) {
      result = commands[j](target, fn);

      if (result !== void 0) {
        break;
      }
    }

    return result;
  };
};
