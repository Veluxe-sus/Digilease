// The stack on the left, the opened card on the right.
//
// Two to six cards ride React Bits' DepthCarousel. One card has no depth to move
// through, so it sits still. Past six the stack gets too deep to read, so it falls
// back to a scroll-snap rail. Carousel focus opens that card on the right.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DepthCarousel from "../components/reactbits/DepthCarousel.jsx";
import CardDetail from "../components/CardDetail.jsx";
import { api } from "../lib/api.js";
import { formatDigipin } from "../lib/format.js";

const MAX_IN_DECK = 6;

function savedOn(value) {
  if (!value) return "Address card";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Address card";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function PassFace({ card }) {
  return (
    <div className="deck-face">
      <div className="deck-pass-head">
        <strong className="pass-mark">DigiLease</strong>
        <span className="deck-hint">Private address pass</span>
      </div>

      <div className="deck-pass-body">
        <span className="deck-kicker">India Post DIGIPIN</span>
        <strong className="deck-code">{formatDigipin(card.digipin)}</strong>
        <p className="deck-landmark">{card.landmark || <span className="muted">No landmark added</span>}</p>
        <span className="deck-dot-field" aria-hidden="true" />
      </div>

      <div className="deck-pass-meta">
        <div>
          <span>Saved</span>
          <strong>{savedOn(card.createdAt)}</strong>
        </div>
        <div>
          <span>Sharing</span>
          <strong>By private link</strong>
        </div>
      </div>

      <div className="pass-tear deck-tear" aria-hidden="true" />
      <div className="deck-pass-foot">
        <span>Open card</span>
        <span aria-hidden="true">→</span>
      </div>
    </div>
  );
}

export default function MyCards() {
  const [cards, setCards] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailDirection, setDetailDirection] = useState("next");

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

  function chooseCard(cardId) {
    if (cardId === selected) return;
    const from = cards.findIndex((card) => card.cardId === selected);
    const to = cards.findIndex((card) => card.cardId === cardId);
    setDetailDirection(from >= 0 && to < from ? "prev" : "next");
    setSelected(cardId);
  }

  return (
    <main className="cards-split">
      <section className="deck-side" aria-label="Your cards">
        <div className="deck-head-row">
          <h1>My cards</h1>
          <span className="muted small">{cards.length} {cards.length === 1 ? "card" : "cards"}</span>
        </div>

        {useDeck && (
          <div className="deck-stage">
            <DepthCarousel
              items={cards.map((card) => ({ ...card, alt: `Address card ${formatDigipin(card.digipin)}` }))}
              renderItem={(card) => <PassFace card={card} />}
              cardWidth={292}
              cardHeight={360}
              radius={18}
              depth={120}
              spread={50}
              tilt={9}
              visibleCards={2}
              falloff={0.1}
              blur={1}
              duration={520}
              ariaLabel="Your address cards"
              onChange={(_, card) => chooseCard(card.cardId)}
            />
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
                  onClick={() => chooseCard(c.cardId)}
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
        {selected && (
          <div key={selected} className={`detail-transition detail-transition--${detailDirection}`}>
            <CardDetail id={selected} />
          </div>
        )}
      </div>
    </main>
  );
}
