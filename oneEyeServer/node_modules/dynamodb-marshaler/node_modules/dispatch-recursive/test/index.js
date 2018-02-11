var assert = require('assert');
var noop = require('lodash/noop');
var sinon = require('sinon');
var spy = sinon.spy;
var stub = sinon.stub;
var dispatch = require('../index');

describe('dispatch-recursive', function() {
  it('should return a function which loops commands until one returns',
      function() {
    var myCmd = stub().returnsArg(0);
    var uncalledCmd = spy();
    var fn = dispatch(noop, noop, myCmd, uncalledCmd);
    var result = fn('foo');

    assert.equal(result, 'foo');

    assert(myCmd.calledOnce);
    assert.equal(myCmd.args[0].length, 2);
    assert.equal(myCmd.args[0][0], 'foo');
    assert.equal(myCmd.args[0][1], fn);

    assert(!uncalledCmd.called);
  });
});
