'use strict'

// =============================================================================
// Transformation / OOB helpers
// =============================================================================
function normalizeTransformation(t) {
    if (t == null || t === '') return 'none';
    const s = String(t).toLowerCase().replace(/[_\s-]/g, '');
    if (s.includes('abs')) return 'absolute';
    if (s.includes('wrap')) return 'wrap360';
    return 'none';
}

function applyTransformation(preferredUnitValue, transformation) {
    let val = Number(preferredUnitValue);
    if (!Number.isFinite(val)) return NaN;

    const t = normalizeTransformation(transformation);
    if (t === 'absolute') return Math.abs(val);
    if (t === 'wrap360') {
        val = val % 360;
        if (val < 0) val += 360;
        return val;
    }
    return val;
}

module.exports = {
	normalizeTransformation,
	applyTransformation
}