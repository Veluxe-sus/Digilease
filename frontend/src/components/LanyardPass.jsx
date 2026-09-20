// The hero's hanging pass. CSS only: a ribbon, a clip, a card, and a slow sway
// with the transform origin up at the clip so it swings from the right place.
// Moving the pointer across it tilts it; prefers-reduced-motion stops all of it.
//
// Every field on the pass is a field the real app has. The countdown is a real
// countdown. There is no photo here because the project has no door photograph to
// show; the card renders the same without one, exactly as it does for an owner who
// skipped the photo.
import { useEffect, useRef, useState } from "react";
import { formatDigipin } from "../lib/format.js";
import BorderGlow from "./reactbits/BorderGlow.jsx";

const SAMPLE_CODE = "4T396F42L7";
const WINDOW_MS = 23 * 3600e3 + 48 * 60e3;

function useCountdown(ms) {
  const [left, setLeft] = useState(ms);
  useEffect(() => {
    const end = Date.now() + ms;
    const id = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    return () => clearInterval(id);
  }, [ms]);
  const h = Math.floor(left / 3600e3);
  const m = Math.floor((left % 3600e3) / 60e3);
  const s = Math.floor((left % 60e3) / 1000);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

export default function LanyardPass() {
  const ref = useRef(null);
  const left = useCountdown(WINDOW_MS);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.setProperty("--tilt-y", `${dx * 7}deg`);
      el.style.setProperty("--tilt-x", `${dy * -5}deg`);
    };
    const onLeave = () => {
      el.style.setProperty("--tilt-y", "0deg");
      el.style.setProperty("--tilt-x", "0deg");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="lanyard" ref={ref} aria-label="An example DigiLease pass">
      <div className="lanyard-ribbon" aria-hidden="true" />
      <div className="lanyard-clip" aria-hidden="true" />

      <BorderGlow
        className="pass-glow"
        backgroundColor="#FFFFFF"
        borderRadius={16}
        edgeSensitivity={34}
        glowRadius={28}
        glowIntensity={0.42}
        coneSpread={20}
        fillOpacity={0.08}
        colors={["#B05A28", "#D9CFA8", "#4A7A3A"]}
      >
        <article className="pass">
          <header className="pass-head">
            <strong className="pass-mark">DigiLease</strong>
            <span className="pass-state">Live</span>
          </header>

          <div className="pass-plate">
            <span className="pass-plate-label">DIGIPIN</span>
            <strong className="pass-plate-code">{formatDigipin(SAMPLE_CODE)}</strong>
          </div>

          <p className="pass-landmark">Blue gate, behind Hanuman temple, 2nd lane</p>

          <dl className="pass-meta">
            <div>
              <dt>For</dt>
              <dd>Ambulance</dd>
            </div>
            <div>
              <dt>Expires in</dt>
              <dd className="code-num">{left}</dd>
            </div>
          </dl>

          <div className="pass-tear" aria-hidden="true" />
          <footer className="pass-foot">
            <span className="muted small">Opened once, 14:02</span>
            <span className="pass-revoke">Revoke</span>
          </footer>
        </article>
      </BorderGlow>
    </div>
  );
}
