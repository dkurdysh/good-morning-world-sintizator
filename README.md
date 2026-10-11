# Good morning, world!

A two-voice web synthesizer built with React, Vite and Tone.js. The visual interface follows the supplied Figma-style screenshot, without extra visible controls.

## Run in VS Code

1. Open this folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local address shown in the terminal (usually `http://localhost:5173/`).

The first press of **Power** unlocks sound in the browser and starts both repeating musical parts. Press again to stop. Sliders and oscillator buttons adjust each voice independently in real time.

## Project architecture

- `src/App.jsx`: UI and interaction, five controls per voice.
- `src/style.css`: screenshot-inspired visual system and responsive layout.
- `src/audio.js`: two `Tone.MonoSynth` voices, each using its own filter → feedback delay → reverb → pan/volume channel → output.
- `src/main.jsx`: React bootstrap.

No keyboard, note buttons, sequencer, BPM display, or additional visible sections are included.

### Notes

The initial zero-position volume sliders are purely the screenshot's starting appearance: both voices play at an audible level until the slider is moved. Moving a volume slider to minimum mutes that voice. There is no explicit playhead or note editor. The musical phrases are programmed in `src/audio.js` so that Power can immediately demonstrate both instruments.
