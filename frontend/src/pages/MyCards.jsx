import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { formatDigipin } from "../lib/format.js";

export default function MyCards() {
  const [cards, setCards] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listCards().then((d) => setCards(d.cards)).catch((e) => setError(e.message));
  }, []);

  return (
    <main className="page">
      <h1>My cards</h1>
      {error && <p className="error" role="alert">{error}</p>}
      {!cards && !error && <div className="skeleton" style={{ height: 72 }} />}
      {cards && cards.length === 0 && (
        <div className="empty">
          <p>No address cards yet. Make one for your home or shop, then share it one person at a time.</p>
          <Link to="/new" className="btn-primary">Make my first card</Link>
        </div>
      )}
      {cards && cards.length > 0 && (
        <ul className="rows">
          {cards.map((c) => (
            <li key={c.cardId}>
              <Link to={`/card/${c.cardId}`} className="row-link">
                <span className="code">{formatDigipin(c.digipin)}</span>
                <span className="muted">{c.landmark || "No landmark"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
