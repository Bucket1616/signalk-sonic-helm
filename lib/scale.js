'use strict'

const pentatonicScale = [
    130.81, // C3
    146.83, // D3
    164.81, // E3
    196.00, // G3
    220.00, // A3
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.00, // A5
    1046.50, // C6
    1174.66, // D6
    1318.51, // E6
    1567.98, // G6
    1760.00, // A6
    2093.00, // C7
    2349.32, // D7
    2637.02, // E7
    3135.96, // G7
    3520.00, // A7
    4186.01, // C8
    4698.63, // D8
    5274.04, // E8
    6271.93, // G8
    7040.00, // A8
    8372.02  // C9
];


//Pick the closest note frequency
function quantizeToNote(rawFrequency) {
    return pentatonicScale.reduce((prev, curr) => {
        return (Math.abs(curr - rawFrequency) < Math.abs(prev - rawFrequency) ? curr : prev);
    });
}

module.exports = {
	pentatonicScale,
	quantizeToNote
}
