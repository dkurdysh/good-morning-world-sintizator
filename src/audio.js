import * as Tone from 'tone';

// Two separate sound sources and effects chains. The UI deliberately displays
// only the controls included in the original design.
const patterns = [
  [
    ['C5', 0.0, '8n'], ['E5', 0.5, '8n'], ['G5', 1.0, '8n'], ['E5', 1.5, '8n'],
    ['D5', 2.0, '8n'], ['F5', 2.5, '8n'], ['A5', 3.0, '8n'], ['G5', 3.5, '8n'],
    ['E5', 4.0, '8n'], ['C5', 4.5, '8n'], ['D5', 5.0, '8n'], ['G5', 5.5, '8n'],
    ['F5', 6.0, '8n'], ['E5', 6.5, '8n'], ['D5', 7.0, '8n'], ['C5', 7.5, '8n'],
  ],
  [
    ['C3', 0.0, '4n'], ['C3', 1.0, '8n'], ['G3', 1.5, '8n'],
    ['F3', 2.0, '4n'], ['F3', 3.0, '8n'], ['C3', 3.5, '8n'],
    ['A2', 4.0, '4n'], ['E3', 5.0, '8n'], ['G2', 5.5, '8n'],
    ['G2', 6.0, '4n'], ['B2', 7.0, '8n'], ['G3', 7.5, '8n'],
  ],
];

const clamp = (number, min, max) => Math.min(max, Math.max(min, number));

export class DualSynthEngine {
  constructor() {
    this.channels = [0, 1].map((index) => {
      const channel = new Tone.Channel({ volume: index === 0 ? -12 : -13, pan: index === 0 ? -0.35 : 0.35 });
      const reverb = new Tone.Reverb({ decay: index === 0 ? 2.0 : 1.2, wet: index === 0 ? 0.16 : 0.1 });
      const delay = new Tone.FeedbackDelay({ delayTime: index === 0 ? '8n' : '4n', feedback: 0.16, wet: index === 0 ? 0.12 : 0.06 });
      const filter = new Tone.Filter({ frequency: index === 0 ? 3200 : 1100, type: 'lowpass' });
      const synth = new Tone.MonoSynth({
        oscillator: { type: index === 0 ? 'sine' : 'triangle', phase: 0 },
        envelope: { attack: 0.025, decay: 0.15, sustain: index === 0 ? 0.35 : 0.6, release: 0.24 },
        filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.35, release: 0.3, baseFrequency: index === 0 ? 250 : 90, octaves: 2.5 },
        portamento: 0,
      });
      synth.chain(filter, delay, reverb, channel);
      channel.toDestination();
      return { synth, filter, delay, reverb, channel };
    });
    this.loops = patterns.map((pattern, index) => new Tone.Part((time, event) => {
      this.channels[index].synth.triggerAttackRelease(event.note, event.length, time, index === 0 ? 0.72 : 0.76);
    }, pattern.map(([note, beat, length]) => ({ time: `0:${beat}`, note, length }))));
    this.loops.forEach((loop) => {
      loop.loop = true;
      loop.loopEnd = '2m';
      loop.start(0);
    });
    Tone.getTransport().bpm.value = 108;
    this.playing = false;
  }

  setParameter(index, parameter, value) {
    const track = this.channels[index];
    if (!track) return;
    const { synth, channel } = track;
    if (parameter === 'volume') {
      // -60 dB is silence; volume rises smoothly to roughly 0 dB.
      channel.volume.value = value <= 0 ? -Infinity : -40 + 40 * Math.pow(value / 100, 0.72);
    } else if (parameter === 'portamento') {
      synth.portamento = 0.002 + (value / 100) * 0.65;
    } else if (parameter === 'type') {
      synth.oscillator.type = value;
    } else if (parameter === 'detune') {
      synth.oscillator.detune.value = (value / 100) * 100 - 50;
    } else if (parameter === 'phase') {
      synth.oscillator.phase = clamp(value, 0, 100) * 3.6;
    }
  }

  async start() {
    await Tone.start(); // Must be called from a user gesture.
    const transport = Tone.getTransport();
    transport.stop();
    transport.position = '0:0:0';
    transport.start();
    this.playing = true;
  }

  stop() {
    Tone.getTransport().stop();
    this.channels.forEach(({ synth }) => synth.triggerRelease());
    this.playing = false;
  }

  dispose() {
    this.stop();
    this.loops.forEach((loop) => loop.dispose());
    this.channels.forEach((track) => Object.values(track).forEach((node) => node.dispose()));
  }
}
