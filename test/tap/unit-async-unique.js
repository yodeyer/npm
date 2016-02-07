'use strict'
var test = require('tap').test
var unique = require('../../lib/utils/async-unique.js')

test('unique', function (t) {
  var logs = []
  var callbacks = {}
  var results = {}

  var testFunction = unique(function (key, num, done) {
    logs.push('start' + num)
    callbacks[num] = function () {
      logs.push('end' + num)
      done(num)
    }
  })

  testFunction('foo', 0, function (result) {
    results[0] = result
  })
  testFunction('foo', 1, function (result) {
    results[1] = result
  })
  testFunction('bar', 2, function (result) {
    results[2] = result
    // call #1 has same key as #0, so it is executed when #0 is finished (and after #2)
    t.deepEqual(logs, [ 'start0', 'start2', 'end0', 'start1', 'end1', 'end2' ], 'got expected execution order')
    t.deepEqual(results, {0: 0, 1: 1, 2: 2}, 'got expected results')
    t.end()
  })

  process.nextTick(function () {
    callbacks[0]()
    process.nextTick(function () {
      callbacks[1]()
      callbacks[2]()
    })
  })
})
