# Sonic Helm SignalK Plugin

A SignalK plugin designed to provide audio feedback and signaling via the Web Audio API, based on two signalk inputs; one used to modify the audio frequency and the other to modify the duty cycle.

## Overview

The Sonic Helm SignalK Plugin translates data from the SignalK server into audible signals. It uses a scheduler to generate pulses of sound based on incoming data streams, allowing for real-time auditory monitoring of vessel metrics.

### Key Features
- **Pulse-Based Audio:** Generates tones using Web Audio API oscillators.
- **Duty Cycle Control:** Controls the "on-time" (`onMs`) of a signal within a fixed period (`FIXED_PERIOD_MS`), allowing for varied rhythmic feedback.
- **Dynamic Frequency:** Adjusts tone frequency based on the `currentFreq` variable, snapping it to a musical note for better sound.
- **Safety Muting:** Includes logic to silence audio when parameters are out of bounds (`freqOutOfBoundsStop`, `periodOutOfBoundsStop`).

## Technical Details

### Audio Scheduling Logic
The plugin utilizes a `scheduleAudioDuty` function that runs via `requestAnimationFrame`. It looks ahead by approximately 0.1 seconds to schedule `playPulseDuty` events.

## Using Sonic Helm

There are two parts: **configure the plugin once** in SignalK Admin, then **use the webapp** anytime you want live visual and audio monitoring.

## How to Configure the Plugin

You configure Sonic Helm in the SignalK Server Admin interface. You do not need to edit code for normal setup.

### 1. Open the plugin settings
1. Open your SignalK Server Admin page in a browser (often something like `http://your-boat-computer:3000/admin`).
2. Go to **Server** → **Plugin Config** (wording may vary slightly by SignalK version).
3. Find **Sonic Helm** / **signalk-sonic-helm** and open its settings.
4. Enable the plugin if it is not already enabled.
5. Click **Save**, then restart the plugin or SignalK server if prompted.

### 2. Create one or more listening “modes”
A **mode** is a named setup for a job you care about, for example:
- **Wind** – listen to wind changes while sailing
- **Speed and Depth** – listen while motoring in shallow water
- **Docking** – short-range awareness near the dock

Each mode usually has two mappings:

| Mapping | What it controls | Simple meaning |
| :------ | :--------------- | :------------- |
| Frequency mapping | Pitch of the tone (Hz) | Higher/lower tone as the value changes |
| Period mapping | Pulse timing / on-time (ms) | How the beeps are spaced or how long each beep lasts |

### 3. Fill in each mapping
For each mapping, set:

1. **SignalK path**  
   The data source, for example:
   - `environment.wind.speedApparent`
   - `navigation.speedOverGround`
   - `environment.depth.belowTransducer`  
   Tip: pick paths that already show live values elsewhere in SignalK.

2. **Data range (`dataMin` / `dataMax`)**  
   The value range you care about, in the **display units you choose** (for example knots, feet, °C), not raw lab units.
   - Example: speed from `0.5` to `8` knots
   - Example: depth from `3` to `30` feet

3. **Audio range**
   - Frequency mapping: `hzMin` / `hzMax` (how low/high the tone can go)
   - Period mapping: `msMin` / `msMax` (shortest/longest pulse timing or on-time)

4. **Transformation** (optional)  
   How the incoming number is shaped before it becomes sound (for example linear, or another supported transform). If unsure, start with the default/linear option.

5. **Out-of-bounds behavior**  
   What should happen when the value goes below `dataMin` or above `dataMax`:
   - **Clamp** – hold at the edge value
   - **Stop Sound** – mute audio for that condition
   - **Ignore** – skip that sample and keep the previous sound state
   - **Wrap** / **Wrap 360** – useful for circular values like heading

   Practical tip: for “don’t beep when almost stopped,” set speed `dataMin` to something like `0.5` and use **Stop Sound** below that.

6. **Units**  
   Choose the unit you want to think in (knots, mph, meters, feet, °C, °F, degrees, and so on).  
   Sonic Helm expects SignalK’s standard SI values on the wire and converts them to your preferred unit for display, histograms, and sound mapping.

### 4. Save and verify
1. Save the plugin configuration.
2. Restart the plugin/server if required.
3. Confirm the settings are available to the webapp (open the Sonic Helm page and check that your mode names appear in the configuration dropdown).

### Configuration checklist
- [ ] Plugin enabled and saved
- [ ] At least one mode with a clear name
- [ ] Valid SignalK paths that actually update on your boat
- [ ] Sensible `dataMin` / `dataMax` in your preferred units
- [ ] Frequency and period audio ranges you can hear comfortably
- [ ] Out-of-bounds behavior set the way you want (especially **Stop Sound**)
- [ ] Mode appears in the webapp dropdown after refresh

---

## How to Use the Webapp

The webapp is the browser page where you monitor data visually and turn the sound on.

### 1. Open the app
1. Make sure SignalK Server is running and Sonic Helm is enabled.
2. Open the Sonic Helm webapp from your SignalK plugins/webapps list, or go directly to the plugin page on your server.
3. Use a modern browser on the device you want to hear sound from (helm computer, laptop, or tablet).

### 2. Choose a configuration (mode)
1. Use the **configuration** dropdown at the top.
2. Select the mode you configured earlier (for example **Wind** or **Speed and Depth**).
3. You can usually switch modes while monitoring; the app updates the active paths and display.

### 3. Start monitoring (data only)
1. Click **Start Monitoring**.
2. The app connects to SignalK and begins receiving live values.
3. You should see:
   - recent values for the active paths
   - histogram/history graphs filling in over time
4. Use **Stop Monitoring** when you want to disconnect.

No sound plays yet at this stage. That is intentional.

### 4. Enable audio (sound)
Browsers block sound until you click something, so audio is a separate step:

1. After monitoring is running, click **Enable Audio**.
2. Allow audio if the browser asks.
3. You should hear pulses/tones that change with your data.
4. Click **Stop Audio** to mute without fully disconnecting, or stop monitoring to shut things down more completely.

### 5. Read the live display
While running, the page typically shows:
- **Active paths** being watched
- **Recent values** (with units when available)
- **Histograms** for frequency-related and period-related data over the selected history window (for example last 10 / 30 / 60 minutes)

Use the history control to zoom the time window of the graphs.

### 6. Suggested first-time walkthrough
1. Pick a simple mode with one clearly changing value (wind or speed works well).
2. Start Monitoring and confirm numbers move.
3. Enable Audio at low volume.
4. Watch the value change and listen for pitch and pulse changes.
5. Test an out-of-range condition (for example very low speed) and confirm **Stop Sound** mutes if you configured it that way.
6. Switch modes once and confirm the labels/values update.

### 7. Everyday operation tips
- Start with volume low until you know the tone range.
- If you hear nothing:
  - confirm **Start Monitoring** is active
  - confirm **Enable Audio** was clicked
  - check that values are inside your configured range
  - check that out-of-bounds is not set to **Stop Sound** for the current values
- Stopping monitoring should also clear/stop audio cleanly.
- Keep the browser tab open for best audio timing; some browsers reduce timer accuracy in background tabs.

### Quick controls reference

| Control | What it does |
| :------ | :----------- |
| Configuration dropdown | Selects which saved mode to use |
| Start Monitoring | Connects to SignalK and shows live data |
| Stop Monitoring | Disconnects and resets monitoring state |
| Enable Audio | Starts sound (required browser gesture) |
| Stop Audio | Silences sound |
| History window | Sets how much past data the graphs show |
