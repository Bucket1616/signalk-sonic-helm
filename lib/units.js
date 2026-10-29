'use strict'


function quantityFromPreferredUnit(prefUnit) {
    const u = normalizeUnit(prefUnit);
    if (u === 'm/s' || u === 'knots' || u === 'mph') return 'speed';
    if (u === 'm' || u === 'feet' || u === 'NM') return 'length';
    if (u === 'K' || u === '°C' || u === '°F') return 'temperature';
    if (u === 'rad' || u === 'deg') return 'angle';
    return 'raw';
}

function quantityFromPath(path) {
    const p = String(path || '').toLowerCase();
    if (!p) return 'raw';

    if (p.includes('speed') || p.includes('wind.speed') || p.includes('sow') || p.includes('sog') || p.includes('stw') || p.includes('velocity')) return 'speed';
    if (p.includes('heading') || p.includes('course') || p.includes('bearing') || p.includes('angle') || p.includes('direction') || (p.includes('latitude') === false && p.includes('wind.angle'))) return 'angle';
    if (p.includes('wind.angle') || p.includes('rudder') || p.includes('awa') || p.includes('twa')) return 'angle';
    if (p.includes('depth') || p.includes('altitude') || p.includes('height') || p.includes('length') || p.includes('distance')) return 'length';
    if (p.includes('temperature') || p.includes('temp')) return 'temperature';

    return 'raw';
}

function siUnitForQuantity(q) {
    switch (q) {
        case 'speed': return 'm/s';
        case 'length': return 'm';
        case 'temperature': return 'K';
        case 'angle': return 'rad';
        default: return null;
    }
}


// =============================================================================
// Unit conversion (SignalK wire = SI → user preferred unit)
// =============================================================================
function normalizeUnit(u) {
    if (u == null) return '';
    let s = String(u).trim().toLowerCase();

    s = s.replace('°', '');
    s = s.replace('degrees', 'deg').replace('degree', 'deg');
    s = s.replace('celsius', 'c').replace('fahrenheit', 'f');
    s = s.replace('kelvin', 'k');
    s = s.replace('meters/sec', 'm/s').replace('meter/sec', 'm/s').replace('mps', 'm/s');
    s = s.replace('meter', 'm').replace('metres', 'm').replace('metre', 'm');
    s = s.replace('foot', 'ft').replace('feet', 'ft');
    s = s.replace('nautical miles', 'nm').replace('nautical mile', 'nm');
    s = s.replace('knot', 'kn').replace('knots', 'kn');
    s = s.replace('mile/h', 'mph').replace('miles/h', 'mph').replace('miles per hour', 'mph');

    if (s === 'ms' || s === 'm/s') return 'm/s';
    if (s === 'kn' || s === 'kt' || s === 'kts') return 'knots';
    if (s === 'mph') return 'mph';
    if (s === 'm') return 'm';
    if (s === 'ft') return 'feet';
    if (s === 'nm') return 'NM';
    if (s === 'c') return '°C';
    if (s === 'f') return '°F';
    if (s === 'k') return 'K';
    if (s === 'deg' || s === 'rad' || s === 'radian' || s === 'radians') {
        return s.startsWith('rad') ? 'rad' : 'deg';
    }
    return String(u).trim();
}

function formatValueWithUnit(value, unit) {
    const num = (typeof value === 'number') ? value : Number(value);
    const text = Number.isFinite(num) ? (Math.round(num * 1000) / 1000).toString() : String(value);
    return unit ? `${text} ${unit}` : text;
}

function convertSiToPreferred(siValue, mapping, pathForFallback) {
    const rawNum = Number(siValue);
    if (!Number.isFinite(rawNum)) return { value: NaN, unit: '', quantity: 'raw' };

    let pref = getMappingUnit(mapping);
    let quantity = quantityFromPreferredUnit(pref);

    if (quantity === 'raw') {
        quantity = quantityFromPath(pathForFallback || (mapping && mapping.path));
        if (quantity === 'speed') pref = 'knots';
        else if (quantity === 'angle') pref = 'deg';
        else if (quantity === 'length') pref = 'm';
        else if (quantity === 'temperature') pref = '°C';
        else pref = '';
    }

    const si = siUnitForQuantity(quantity);
    if (!si || !pref) return { value: rawNum, unit: pref || '', quantity };

    let v = rawNum;
    if (quantity === 'speed') {
        if (pref === 'knots') v = rawNum * 1.9438444924406;
        else if (pref === 'mph') v = rawNum * 2.2369362920544;
    } else if (quantity === 'length') {
        if (pref === 'feet') v = rawNum * 3.2808398950131;
        else if (pref === 'NM') v = rawNum / 1852;
    } else if (quantity === 'temperature') {
        if (pref === '°C') v = rawNum - 273.15;
        else if (pref === '°F') v = (rawNum - 273.15) * 9 / 5 + 32;
    } else if (quantity === 'angle') {
        if (pref === 'deg') v = rawNum * 180 / Math.PI;
    }

    return { value: v, unit: pref, quantity };
}

function isDegreesUnit(unit) {
    return normalizeUnit(unit) === 'deg';
}


function getMappingUnit(mapping) {
    if (!mapping) return '';
    return normalizeUnit(mapping.unit || mapping.units || mapping.dataUnit || mapping.dataUnits || '');
}

// --- exports ---
module.exports = {
  quantityFromPreferredUnit,
  normalizeUnit,
  formatValueWithUnit,
  convertSiToPreferred,
  isDegreesUnit,
  getMappingUnit
}