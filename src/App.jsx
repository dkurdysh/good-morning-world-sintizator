import React, { useEffect, useRef, useState } from "react";
import { DualSynthEngine } from "./audio.js";

const waves = ["sine", "square", "sawtooth", "triangle"];
const initial = [
  { volume: 0, portamento: 0, type: null, detune: 0, phase: 0 },
  { volume: 0, portamento: 0, type: null, detune: 0, phase: 0 },
];

function ControlSlider({ title, value, onChange }) {
  return (
    <div className="control-slider">
      <div className="slider-heading">
        <span className="slider-bound">min</span>
        <span className="slider-title">{title}</span>
        <span className="slider-bound">max</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={title}
      />
    </div>
  );
}

function SynthCard({ number, config, onParameter }) {
  return (
    <section className="synth-card" aria-label={`Synth ${number}`}>
      <header className="synth-header">
        <h2>Synth</h2>
        <span className="synth-number">{number}</span>
      </header>
      <div className="card-controls">
        <ControlSlider
          title="volume"
          value={config.volume}
          onChange={(value) => onParameter("volume", value)}
        />
        <ControlSlider
          title="portamento"
          value={config.portamento}
          onChange={(value) => onParameter("portamento", value)}
        />
        <div className="type-control">
          <div className="type-title">type</div>
          <div
            className="wave-buttons"
            role="group"
            aria-label={`Synth ${number} type`}
          >
            {waves.map((wave) => (
              <button
                key={wave}
                type="button"
                className={`wave-button ${config.type === wave ? "selected" : ""}`}
                aria-pressed={config.type === wave}
                onClick={() => onParameter("type", wave)}
              >
                {wave}
              </button>
            ))}
          </div>
        </div>
        <ControlSlider
          title="detune"
          value={config.detune}
          onChange={(value) => onParameter("detune", value)}
        />
        <ControlSlider
          title="phase"
          value={config.phase}
          onChange={(value) => onParameter("phase", value)}
        />
      </div>
    </section>
  );
}

export default function App() {
  const [settings, setSettings] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const engine = useRef(null);
  const busy = useRef(false);

  useEffect(
    () => () => {
      engine.current?.dispose();
      engine.current = null;
    },
    [],
  );

  function update(index, key, value) {
    setSettings((previous) =>
      previous.map((setting, i) =>
        i === index ? { ...setting, [key]: value } : setting,
      ),
    );
    engine.current?.setParameter(index, key, value);
  }

  async function togglePower() {
    if (busy.current) return;
    busy.current = true;
    try {
      if (playing) {
        engine.current?.stop();
        setPlaying(false);
      } else {
        if (!engine.current) {
          engine.current = new DualSynthEngine();
          settings.forEach((setting, index) =>
            Object.entries(setting).forEach(([key, value]) => {
              if (key === "type" && value === null) return;
              // The visual sliders start at the far left, but the initial sound
              // must be audible. Use an audible default until volume is moved.
              if (key === "volume" && value === 0) return;
              engine.current.setParameter(index, key, value);
            }),
          );
        }
        await engine.current.start();
        setPlaying(true);
      }
      setError("");
    } catch (e) {
      setError(
        "Не удалось запустить звук. Проверьте громкость устройства и попробуйте ещё раз.",
      );
      console.error(e);
    } finally {
      busy.current = false;
    }
  }

  return (
    <main className="page">
      <h1 className="site-heading">
        <span>Good morning,</span>
        <span>world!</span>
      </h1>
      <button
        className={`power ${playing ? "is-on" : ""}`}
        type="button"
        aria-pressed={playing}
        onClick={togglePower}
      >
        Power
      </button>
      <div className="synth-grid">
        {settings.map((setting, index) => (
          <SynthCard
            key={index}
            number={index + 1}
            config={setting}
            onParameter={(key, value) => update(index, key, value)}
          />
        ))}
      </div>
      <footer className="footer">
        <span>Daryna Kurdysh</span>
        <span>2026</span>
      </footer>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
