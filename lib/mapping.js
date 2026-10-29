'use strict'

const minPulseDuty = 10;   // 10% minimum on-time
const maxPulseDuty = 90;   // 90% maximum on-time


const { getOobBehaviors, normalizeOobToken } = require('./oob')
const { applyTransformation, normalizeTransformation } = require('./transform')

function calculateMapping(preferredValue, config, type) {
    const fallback = type === 'hz' ? 0 : minPulseDuty;
    if (!config) return { value: fallback, stop: true, side: null };

    let v = applyTransformation(preferredValue, config.transformation);
    if (!Number.isFinite(v)) return { value: fallback, stop: true, side: null };

    const dataMin = Number(config.dataMin);
    const dataMax = Number(config.dataMax);
    const hasMin = Number.isFinite(dataMin);
    const hasMax = Number.isFinite(dataMax);
    const oob = getOobBehaviors(config);
    let side = 'in';

    if (hasMin && v < dataMin) {
        side = 'min';
        if (oob.min === 'stop') return { value: fallback, stop: true, side };
        if (oob.min === 'ignore') return { value: fallback, stop: false, side };
        if (oob.min === 'wrap' && hasMin && hasMax && dataMax > dataMin) {
            const span = dataMax - dataMin;
            v = ((v - dataMin) % span + span) % span + dataMin;
            side = 'in';
        } else {
            v = dataMin;
        }
    }

    if (hasMax && v > dataMax) {
        side = 'max';
        if (oob.max === 'stop') return { value: fallback, stop: true, side };
        if (oob.max === 'ignore') return { value: fallback, stop: false, side };
        if (oob.max === 'wrap' && hasMin && hasMax && dataMax > dataMin) {
            const span = dataMax - dataMin;
            v = ((v - dataMin) % span + span) % span + dataMin;
            side = 'in';
        } else {
            v = dataMax;
        }
    }

    const outMin = type === 'hz' ? Number(config.hzMin) : Number(config.minPulseDuty);
    const outMax = type === 'hz' ? Number(config.hzMax) : Number(config.maxPulseDuty);
    const safeOutMin = Number.isFinite(outMin) ? outMin : (type === 'hz' ? 440 : minPulseDuty);
    const safeOutMax = Number.isFinite(outMax) ? outMax : (type === 'hz' ? 880 : maxPulseDuty);

    if (!hasMin || !hasMax || dataMax === dataMin) return { value: safeOutMin, stop: false, side };

    const ratio = (v - dataMin) / (dataMax - dataMin);
    const mapped = safeOutMin + ratio * (safeOutMax - safeOutMin);
    return { value: mapped, stop: false, side };
}




module.exports = {
	calculateMapping
}
