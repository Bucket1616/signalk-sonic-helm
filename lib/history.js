'use strict'

const { getOobBehaviors, normalizeOobToken } = require('./oob')
const { normalizeTransformation } = require('./transform')
const { quantityFromPreferredUnit, getMappingUnit, isDegreesUnit } = require('./units')


function trimHistoryArray(arr) {
    const MAX_HISTORY_MS = 60 * 60 * 1000; // 60 minutes in milliseconds
    const now = Date.now();
    
    // Remove data older than 60 minutes
    while (arr.length > 0 && (now - arr[0].t) > MAX_HISTORY_MS) {
        arr.shift();
    }
}

function computeYAxisRange(mapping, historyArr) {
    const t = normalizeTransformation(mapping && mapping.transformation);
    const unit = getMappingUnit(mapping);
    const degrees = isDegreesUnit(unit) || quantityFromPreferredUnit(unit) === 'angle';

    let yMin;
    let yMax;

    if (t === 'wrap360') {
        yMin = 0; yMax = 360;
    } else if (t === 'absolute') {
        yMin = degrees ? -180 : 0; yMax = 180;
    } else {
        yMin = 0; yMax = (mapping && typeof mapping.dataMax === 'number') ? mapping.dataMax : 1;
    }

    let maxStored = -Infinity;
    let minStored = Infinity;
    for (let i = 0; i < historyArr.length; i++) {
        const v = historyArr[i].v;
        if (!Number.isFinite(v)) continue;
        if (v > maxStored) maxStored = v;
        if (v < minStored) minStored = v;
    }

    if (Number.isFinite(maxStored)) {
        const roundedUp = Math.ceil(maxStored);
        if (roundedUp > yMax) yMax = roundedUp;
    }

    if (t === 'absolute' && degrees && Number.isFinite(minStored) && minStored < yMin) yMin = Math.floor(minStored);
    if (t === 'none' && Number.isFinite(minStored) && minStored < yMin) {
        if (minStored < 0) yMin = Math.floor(minStored);
    }

    if (!(yMax > yMin)) yMax = yMin + 1;
    return { yMin, yMax };
}

module.exports = {
	trimHistoryArray,
	computeYAxisRange
}
