import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DigipinPlate from "../components/DigipinPlate.jsx";
import MapView from "../components/MapView.jsx";
import OfflineMap from "../components/OfflineMap.jsx";
import { api } from "../lib/api.js";
import { formatDistance, formatDuration, formatShareExpiry, locationError } from "../lib/format.js";
import { canSaveOffline, deleteCopy, loadCopy, saveAppShell, saveJson, savePhoto } from "../lib/offline.js";

function ReceiverHeader({ saveState }) {
  return (
    <header className="topbar">
      <span className="wordmark">PataCard</span>
      {saveState === "saving" && <span className="save-chip">Saving for offline…</span>}
      {saveState === "saved" && <span className="save-chip saved">✓ Saved for offline</span>}
    </header>
  );
}

const ignore = () => {};

export default function SharedView() {
  const { token } = useParams();
  const [card, setCard] = useState(null);
  const [area, setArea] = useState(null);
  const [photoSrc, setPhotoSrc] = useState(null);
  const [route, setRoute] = useState(null);
  const [you, setYou] = useState(null);
  const [dead, setDead] = useState(false);
  const [error, setError] = useState("");
  const [routeError, setRouteError] = useState("");
  const [routing, setRouting] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);
  const [saveState, setSaveState] = useState(null); // saving | saved | null
  const [offline, setOffline] = useState(false); // showing the saved copy because the API can't be reached
  const [backOnline, setBackOnline] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(ignore);
  }, []);

  useEffect(() => {
    let active = true;

    async function saveForOffline(data) {
      const { photoUrl, ...cardData } = data;
      if (!canSaveOffline()) {
        setPhotoSrc(photoUrl);
        return;
      }
      setSaveState("saving");
      // Show the downloaded blob rather than loading the photo twice (a second, CORS fetch of an
      // image the browser already cached without CORS headers can fail).
      const [photo, areaData, shell] = await Promise.allSettled([
        photoUrl ? fetch(photoUrl).then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`photo ${r.status}`)))) : null,
        api.area(token),
        saveAppShell(),
      ]);
      if (!active) return;
      setPhotoSrc(photo.status === "fulfilled" && photo.value ? URL.createObjectURL(photo.value) : photoUrl);
      if (areaData.status === "fulfilled") setArea(areaData.value);
      try {
        await saveJson(token, "card", cardData);
        if (photo.status === "fulfilled" && photo.value) await savePhoto(token, photo.value);
        if (areaData.status === "fulfilled") await saveJson(token, "area", areaData.value);
        if (active) setSaveState(areaData.status === "fulfilled" && shell.status === "fulfilled" ? "saved" : null);
      } catch {
        if (active) setSaveState(null); // storage full or blocked: the live page still works
      }
    }

    api.viewShare(token)
      .then((data) => {
        if (!active) return;
        setCard(data);
        saveForOffline(data);
      })
      .catch(async (err) => {
        if (!active) return;
        if (err.status === 410) {
          setDead(true);
          if (canSaveOffline()) deleteCopy(token).catch(ignore);
          return;
        }
        if (err.status === 0 && canSaveOffline()) {
          const copy = await loadCopy(token).catch(() => null);
          if (!active) return;
          if (copy) {
            setCard(copy.card);
            setArea(copy.area);
            setRoute(copy.route);
            setPhotoSrc(copy.photoUrl);
            setOffline(true);
            return;
          }
        }
        setError(err.message);
      });
    return () => { active = false; };
  }, [token]);

  // Losing the network after a saved load switches to the offline map; its return offers the live page.
  useEffect(() => {
    const down = () => { if (saveState === "saved") setOffline(true); };
    const up = () => setBackOnline(true);
    window.addEventListener("offline", down);
    window.addEventListener("online", up);
    return () => {
      window.removeEventListener("offline", down);
      window.removeEventListener("online", up);
    };
  }, [saveState]);

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
          if (canSaveOffline()) saveJson(token, "route", result).catch(ignore);
        } catch (err) {
          if (err.status === 410) {
            setDead(true);
            if (canSaveOffline()) deleteCopy(token).catch(ignore);
          } else setRouteError(err.message);
        } finally {
          setRouting(false);
        }
      },
      (err) => {
        setRouteError(locationError(err, "open the address in maps"));
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

  if (offline || preview) {
    let banner = "No internet. Showing your saved map.";
    if (preview) banner = "Preview: this is what shows with no internet.";
    else if (backOnline) banner = "Back online";
    return (
      <div className="receiver-shell offline-shell">
        <div className="offline-banner" role="status">
          <span>{banner}</span>
          {(preview || backOnline) && (
            <button type="button" className="btn-banner" onClick={() => (preview ? setPreview(false) : window.location.reload())}>
              Show live map
            </button>
          )}
        </div>
        <OfflineMap card={card} area={area} route={route?.line} photoUrl={photoSrc} />
      </div>
    );
  }

  const pin = { lat: card.lat, lon: card.lon };
  // A plain https link works on iPhone, Android and desktop (geo: is Android-only).
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${card.lat},${card.lon}`;

  return (
    <div className="receiver-shell">
      <ReceiverHeader saveState={saveState} />
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
            {photoSrc && photoOk && (
              <img className="door" src={photoSrc} alt="Shared door" onError={() => setPhotoOk(false)} />
            )}
          </div>

          <p className="muted small code-num receiver-expiry">{formatShareExpiry(card.expiresAt)}</p>
          {area && <button type="button" className="btn-text preview-offline" onClick={() => setPreview(true)}>Preview offline map</button>}
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
