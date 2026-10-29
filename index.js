	module.exports = function (app) {
  const plugin = {};

  plugin.id = 'signalk-sonic-helm';
  plugin.name = 'Sonic Helm';
  plugin.description = 'Maps SignalK data paths to synthesized audio notes at mapped duty cycles.';

  plugin.start = function (options, restartPlugin) {
    app.debug('Sonic Helm started');
    // The plugin doesn't need to process data internally since the web app 
    // will connect directly to the SignalK WebSocket stream.
        // Save the options so the router can access them
    plugin.options = options; 
  };

  plugin.registerWithRouter = function(router) {
  	router.get('/settings', (req, res) => {
    // Send the current plugin configuration to the frontend (webapp)
    	res.json(plugin.options || {});
  	});
	};
	
  plugin.stop = function () {
    app.debug('Sonic Helm stopped');
  };

  plugin.schema = {
    type: 'object',
    properties: {
      audioModes: {
        type: 'array',
        title: 'Audio Modes',
        description: 'Define custom audio mapping modes (e.g., Wind Mode, Speed Mode)',
        items: {
          type: 'object',
          title: 'Configuration',
          required: ['modeName'],
          properties: {
            modeName: {
              type: 'string',
              title: 'Mode Name'
            },
            frequencyMapping: {
              type: 'object',
              title: 'Pitch / Frequency Mapping (Hz)',
              properties: {
                path: { type: 'string', title: 'SignalK Path (e.g., environment.wind.speedTrue)' },
                source: { type: 'string', title: 'Specific Source ID (Optional)' },
                unit: {type: 'string', title: 'Display Unit', description: 'SignalK data arrives in SI units and is converted to this unit for display, history, limits, and audio mapping.', enum: ["m/s", "knots", "mph", "deg", "m", "feet", "NM", "°C", "°F"], default: 'knots'},
                title: { type: 'string', title: 'Title for charts' },
                transformation: { type: 'string', title: 'Data Transformation', enum: ['None', 'Absolute Value', 'Wrap 360'], default: 'None' },
                dataMin: { type: 'number', title: 'Minimum Data Value' },
                outOfBoundsBehaviorMin: { type: "string", title: "Out of Bounds Behavior - Min Setting", enum: ["clamp", "stop"], enumNames: ["Peg at Min/Max", "Stop Sound"], default: "stop" },
                dataMax: { type: 'number', title: 'Maximum Data Value' },
                outOfBoundsBehaviorMax: { type: "string", title: "Out of Bounds Behavior - Max Setting", enum: ["clamp", "stop"], enumNames: ["Peg at Min/Max", "Stop Sound"], default: "clamp" },
                hzMin: { type: 'number', title: 'Output Minimum (Hz) - Between 130.81 (C3) and 8372.02 (C9)', default: 261.63 },
                hzMax: { type: 'number', title: 'Output Maximum (Hz) - Between 130.81 (C3) and 8372.02 (C9)', default: 1760 }
              }
            },
            dutyCycleMapping: {
              type: 'object',
              title: 'Duty Cycle Mapping (%)',
              properties: {
                path: { type: 'string', title: 'SignalK Path (e.g., environment.wind.angleApparent)' },
                source: { type: 'string', title: 'Specific Source ID (Optional)' },
                unit: {type: 'string', title: 'Display Unit', description: 'SignalK data arrives in SI units and is converted to this unit for display, history, limits, and audio mapping.', enum: ["m/s", "knots", "mph", "deg", "m", "feet", "NM", "°C", "°F"], default: 'knots'},
                title: { type: 'string', title: 'Title for charts' },
                transformation: { type: 'string', title: 'Data Transformation', enum: ['None', 'Absolute Value', 'Wrap 360'], default: 'Absolute Value' },
                dataMin: { type: 'number', title: 'Minimum Data Value' },
                outOfBoundsBehaviorMin: { type: "string", title: "Out of Bounds Behavior - Min Setting", enum: ["clamp", "stop"], enumNames: ["Peg at Min/Max", "Stop Sound"], default: "clamp" },
                dataMax: { type: 'number', title: 'Maximum Data Value' },
								outOfBoundsBehaviorMax: { type: "string", title: "Out of Bounds Behavior - Max Setting", enum: ["clamp", "stop"], enumNames: ["Peg at Min/Max", "Stop Sound"], default: "clamp" },
                fullCycleTime: {type: "number", title: "Full Cycle Time (milliseconds)", default: 750, description: "The total duration of one on/off audio cycle."},
                minPulseDuty: { type: 'number', title: 'Duty Cycle (%) at Minimum Value (0-100)', default: 95 },
                maxPulseDuty: { type: 'number', title: 'Duty Cycle (%) at Maximum Value (0-100)', default: 5 }
              }
            }
          }
        },
        default: [
          {
            modeName: "Wind Monitor",
            frequencyMapping: {
              path: "environment.wind.speedTrue",
              source: "",
              unit: "knots",
              title: "Wind Speed",
              transformation: "None",
              dataMin: 3,
              outOfBoundsBehaviorMin: "stop",
              dataMax: 30,
              outOfBoundsBehaviorMax: "clamp",
              hzMin: 261.63,
              hzMax: 1760
            },
            dutyCycleMapping: {
              path: "environment.wind.angleApparent",
              source: "",
              unit: "deg",
              title: "Wind Angle, Apparant",
              transformation: "Absolute Value",
              dataMin: 0,
              outOfBoundsBehaviorMin: "clamp",
              dataMax: 180,
              outOfBoundsBehaviorMax: "clamp",
              fullCycleTime: 750,
              minPulseDuty: 95,
              maxPulseDuty: 5
            }
          },
          {
            modeName: "Depth & Speed",
            frequencyMapping: {
              path: "environment.depth.belowSurface",
              source: "",
              unit: "m", 
              title: "Depth",
              transformation: "None",
              dataMin: 2,   
              outOfBoundsBehaviorMin: "clamp",
              dataMax: 20,  
              outOfBoundsBehaviorMax: "stop",
              hzMin: 261.63,
              hzMax: 1760
            },
            dutyCycleMapping: {
              path: "navigation.speedOverGround",
              source: "",
              unit: "knots",
              title: "Speed Over Ground",
              transformation: "None",
              dataMin: 0.5,
              outOfBoundsBehaviorMin: "clamp",
              dataMax: 12,
              outOfBoundsBehaviorMax: "clamp",
              fullCycleTime: 700,
              minPulseDuty: 5,
              maxPulseDuty: 95
            }
          }
        ]
      }
    }
  };

  return plugin;
};
