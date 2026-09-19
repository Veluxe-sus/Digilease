import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DigipinPlate from "../components/DigipinPlate.jsx";
import MapView from "../components/MapView.jsx";
import { api } from "../lib/api.js";
import { formatDistance, formatDuration, formatShareExpiry } from "../lib/format.js";

function ReceiverHeader() {
  return (
    <header className="topbar">
      <span className="wordmark">PataCard</span>
    </header>
  );
}

export default function SharedView() {
  const { token } = useParams();
  const [card, setCard] = useState(null);
  const [route, setRoute] = useState(null);
  const [you, setYou] = useState(null);
  const [dead, setDead] = useState(false);
  const [error, setError] = useState("");
  const [routeError, setRouteError] = useState("");
  const [routing, setRouting] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);

  useEffect(() => {
    let active = true;
    api.viewShare(token)
      .then((data) => { if (active) setCard(data); })
      .catch((err) => {
        if (!active) return;
        if (err.status === 410) setDead(true);
        else setError(err.message);
      });
    return () => { active = false; };
  }, [token]);

  function updateRoute() {
    if (!navigator.geolocation) {
      setRouteError("This browser can't share its location. Open the address in maps instead.");
      return;
    }
    setRouting(true);
    setRouteError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const from = { lat: position.coords.latitude, lon: position.coords.longitude };
        setYou(from);
        try {
          const result = await api.route(token, { fromLat: from.lat, fromLon: from.lon });
          setRoute(result);
        } catch (err) {
          if (err.status === 410) setDead(true);
          else setRouteError(err.message);
        } finally {
          setRouting(false);
        }
      },
      () => {
        setRouteError("Location is off or blocked. Allow it in your browser, or open the address in maps.");
        setRouting(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  if (dead) {
    return (
      <div className="receiver-shell">
        <ReceiverHeader />
        <main className="dead-link">
          <p className="label">Link ended</p>
          <h1>This address is no longer shared</h1>
          <p className="muted">Ask the owner for a new PataCard link.</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receiver-shell">
        <ReceiverHeader />
        <main className="dead-link">
          <h1>We couldn't open this address</h1>
          <p className="error" role="alert">{error}</p>
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>Try again</button>
        </main>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="receiver-shell">
        <ReceiverHeader />
        <main className="receiver-loading" aria-label="Loading shared address">
          <div className="skeleton receiver-map-skeleton" />
          <div className="receiver-loading-details">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        </main>
      </div>
    );
  }

  const pin = { lat: card.lat, lon: card.lon };
  // A plain https link works on iPhone, Android and desktop (geo: is Android-only).
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${card.lat},${card.lon}`;

  return (
    <div className="receiver-shell">
      <ReceiverHeader />
      <main className="split receiver-view">
        <section className="split-map" aria-label="Map showing the shared door">
          <MapView pin={pin} route={route?.line} you={you} zoom={17} className="map-tall" />
        </section>

        <section className="split-panel receiver-panel">
          <div className="panel-head">
            <p className="label">Shared with you</p>
            <h1>{card.label}</h1>
          </div>

          <DigipinPlate code={card.digipin} large />

          <div className="place receiver-place">
            <div>
              <span className="field-label">Landmark</span>
              <p className="place-text">{card.landmark || <span className="muted">No landmark added</span>}</p>
            </div>
            {card.photoUrl && photoOk && (
              <img className="door" src={card.photoUrl} alt="Shared door" onError={() => setPhotoOk(false)} />
            )}
          </div>

          <p className="muted small code-num receiver-expiry">{formatShareExpiry(card.expiresAt)}</p>
          {routeError && <p className="error" role="alert">{routeError}</p>}

          <div className="action-bar receiver-actions">
            {route && (
              <p className="route-summary" aria-live="polite">
                {formatDistance(route.distanceMeters)} · {formatDuration(route.durationSeconds)}
              </p>
            )}
            <button type="button" className="btn-primary btn-block" onClick={updateRoute} disabled={routing}>
              {routing ? "Finding route…" : route ? "Update route" : "Route from my location"}
            </button>
            <a className="btn-text open-maps" href={mapsUrl} target="_blank" rel="noopener noreferrer">Open in maps</a>
          </div>
        </section>
      </main>
    </div>
  );
}
