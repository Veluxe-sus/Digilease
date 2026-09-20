// The stack on the left, the opened card on the right.
//
// Two to six cards ride React Bits' CardSwap. One card cannot swap with anything,
// so it sits still. Past six the deck gets too deep to read, so it falls back to a
// scroll-snap rail. Clicking any card opens it on the right; the deck carries on
// shuffling behind, which is why clicking sets the selection rather than the deck.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CardSwap, { Card } from "../components/reactbits/CardSwap.jsx";
import CardDetail from "../components/CardDetail.jsx";
import { api } from "../lib/api.js";
import { formatDigipin } from "../lib/format.js";

const MAX_IN_DECK = 6;

function PassFace({ card }) {
  return (
    <div className="deck-face">
      <div className="deck-head">
        <strong className="pass-mark">DigiLease</strong>
        <span className="deck-hint">Open</span>
      </div>
      <div className="pass-plate">
        <span className="pass-plate-label">DIGIPIN</span>
        <strong className="pass-plate-code">{formatDigipin(card.digipin)}</strong>
      </div>
      <p className="deck-landmark">{card.landmark || <span className="muted">No landmark</span>}</p>
      <div className="pass-tear deck-tear" aria-hidden="true" />
    </div>
  );
}

export default function MyCards() {
  const [cards, setCards] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const deckRef = useRef(null);

  useEffect(() => {
    api.listCards().then((d) => {
      setCards(d.cards);
      if (d.cards.length) setSelected(d.cards[0].cardId);
    }).catch((e) => setError(e.message));
  }, []);

  if (error) return <main className="page"><p className="error" role="alert">{error}</p></main>;
  if (!cards) return <main className="page"><div className="skeleton" style={{ height: 240 }} /></main>;

  if (cards.length === 0) {
    return (
      <main className="page">
        <h1>My cards</h1>
        <div className="empty">
          <p>No address cards yet. Make one for your home or shop, then share it one person at a time.</p>
          <Link to="/new" className="btn-primary">Make my first card</Link>
        </div>
      </main>
    );
  }

  const useDeck = cards.length > 1 && cards.length <= MAX_IN_DECK;

  return (
    <main className="cards-split">
      <section className="deck-side" aria-label="Your cards">
        <div className="deck-head-row">
          <h1>My cards</h1>
          <span className="muted small">{cards.length} {cards.length === 1 ? "card" : "cards"}</span>
        </div>

        {useDeck && (
          <div className="deck-stage" ref={deckRef}>
            <CardSwap
              width={320}
              height={260}
              cardDistance={44}
              verticalDistance={46}
              delay={6000}
              pauseOnHover
              skewAmount={3}
              easing="linear"
              onCardClick={(i) => setSelected(cards[i].cardId)}
            >
              {cards.map((c) => (
                <Card key={c.cardId}><PassFace card={c} /></Card>
              ))}
            </CardSwap>
          </div>
        )}

        {cards.length === 1 && (
          <div className="deck-single">
            <PassFace card={cards[0]} />
          </div>
        )}

        {cards.length > MAX_IN_DECK && (
          <ul className="deck-rail">
            {cards.map((c) => (
              <li key={c.cardId}>
                <button
                  type="button"
                  className={`deck-rail-item ${selected === c.cardId ? "on" : ""}`}
                  aria-current={selected === c.cardId}
                  onClick={() => setSelected(c.cardId)}
                >
                  <PassFace card={c} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <Link to="/new" className="btn-secondary deck-new">Make another card</Link>
      </section>

      <div className="detail-side">
        {selected && <CardDetail key={selected} id={selected} />}
      </div>
    </main>
  );
}
