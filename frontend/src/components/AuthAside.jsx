// The half of the sign-in screen that is not the form. It shows the thing you get
// once you are in: one address pass, with the same sample as the landing page, so
// the form is never a naked box on a grid.
import { Link } from "react-router-dom";
import BlurText from "./reactbits/BlurText.jsx";
import BorderGlow from "./reactbits/BorderGlow.jsx";
import { formatDigipin } from "../lib/format.js";

const SAMPLE_CODE = "4T396F42L7";

export default function AuthAside() {
  return (
    <aside className="auth-brand">
      <Link to="/" className="auth-wordmark">
        <span className="wordmark-mark" aria-hidden="true" />
        <span className="wordmark">DigiLease</span>
      </Link>

      <BlurText
        as="h1"
        className="auth-title"
        text="Hand your address over, and take it back."
        delay={50}
        stepDuration={0.26}
      />
      <p className="auth-lede">
        Sign in to make an address card from your DIGIPIN and share it one link per person.
      </p>

      <BorderGlow
        className="auth-pass-glow"
        backgroundColor="#FFFFFF"
        borderRadius={14}
        edgeSensitivity={34}
        glowRadius={26}
        glowIntensity={0.4}
        coneSpread={20}
        fillOpacity={0.08}
        colors={["#B05A28", "#D2D7C9", "#4A7A3A"]}
      >
        <article className="pass auth-pass">
          <header className="pass-head">
            <strong className="pass-mark">DigiLease</strong>
            <span className="pass-state">Live</span>
          </header>

          <div className="pass-plate">
            <span className="pass-plate-label">DIGIPIN</span>
            <strong className="pass-plate-code">{formatDigipin(SAMPLE_CODE)}</strong>
          </div>

          <p className="pass-landmark">Blue gate, behind Hanuman temple, 2nd lane</p>

          <div className="pass-tear" aria-hidden="true" />
          <footer className="pass-foot">
            <span className="muted small">For Ambulance</span>
            <span className="pass-revoke">Revoke</span>
          </footer>
        </article>
      </BorderGlow>
    </aside>
  );
}
