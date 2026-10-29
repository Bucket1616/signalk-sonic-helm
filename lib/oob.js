'use strict'

function getOobBehaviors(mapping = {}) {
  return {
    min: normalizeOobToken(mapping.outOfBoundsBehaviorMin),
    max: normalizeOobToken(mapping.outOfBoundsBehaviorMax)
  };
}

function normalizeOobToken(value) {
  if (value == null) return 'clamp';
  const s = String(value).trim().toLowerCase();
  if (s.includes('stop') || s.includes('silent') || s.includes('mute')) return 'stop';
  if (s.includes('wrap')) return 'wrap';
  if (s.includes('ignore') || s.includes('skip')) return 'ignore';
  return 'clamp';
}


module.exports = {
	getOobBehaviors,
	normalizeOobToken
}