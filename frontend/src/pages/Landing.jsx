import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="landing">
      <p className="label">India Post DIGIPIN · consent-based sharing</p>
      <h1>An address you can hand over, and take back.</h1>
      <p className="lede">
        Turn your DIGIPIN into an address card with a landmark and a door photo. Share it as a separate link
        for each person: an ambulance, a delivery rider, a guest. See who opened it. Revoke it any time.
      </p>
      <div className="plate plate-lg" aria-label="Example DIGIPIN">4T3 96F4 2L7</div>
      <Link to="/cards" className="btn-primary landing-cta">Make my address card</Link>
      <p className="muted small">
        Receivers need no app and no account. A DIGIPIN points to a square of about 3.8 m.
      </p>
    </main>
  );
}
