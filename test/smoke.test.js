'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const lib = require('../lib')

test('lib exports core helpers', () => {
  assert.equal(typeof lib.calculateMapping, 'function')
  assert.equal(typeof lib.convertSiToPreferred, 'function')
  assert.equal(typeof lib.normalizeOobToken, 'function')
  assert.equal(typeof lib.applyTransformation, 'function')
  assert.equal(typeof lib.audioShouldBeSilent, 'function')
})

test('normalizeOobToken understands schema values', () => {
  assert.equal(lib.normalizeOobToken('stop'), 'stop')
  assert.equal(lib.normalizeOobToken('clamp'), 'clamp')
})

test('calculateMapping returns stop outside range when configured', () => {
  const mapping = {
    dataMin: 0.5,
    dataMax: 10,
    hzMin: 220,
    hzMax: 880,
    transformation: 'None',
    outOfBoundsBehaviorMin: 'stop',
    outOfBoundsBehaviorMax: 'clamp'
  }
  const result = lib.calculateMapping(0.1, mapping, 'hz')
  assert.equal(result.stop, true)
})

test('audioShouldBeSilent OR-gate', () => {
  assert.equal(
    lib.audioShouldBeSilent({
      isAudioEnabled: true,
      freqOutOfBoundsStop: true,
      dutyCycleOutOfBoundsStop: false,
      currentFreq: 440
    }),
    true
  )
})
