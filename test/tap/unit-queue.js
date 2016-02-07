'use strict'
var test = require('tap').test
var queue = require('../../lib/utils/queue.js')

test('queue.limit', function (t) {
  var logs = []
  var callbacks = {}
  var results = {}

  var testFunction = queue(function (num, done) {
    logs.push('start' + num)
    callbacks[num] = function () {
      logs.push('end' + num)
      done(num)
    }
  }).limit(2)

  testFunction(0, function (result) {
    results[0] = result
  })
  testFunction(1, function (result) {
    results[1] = result
  })
  testFunction(2, function (result) {
    results[2] = result
    // call #2 is executed when call #0 is finished
    t.deepEqual(logs, [ 'start0', 'start1', 'end0', 'start2', 'end1', 'end2' ], 'got expected execution order')
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

test('queue.unique', function (t) {
  var logs = []
  var callbacks = {}
  var results = {}

  var testFunction = queue(function (key, num, done) {
    logs.push('start' + num)
    callbacks[num] = function () {
      logs.push('end' + num)
      done(num)
    }
  }).unique()

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
