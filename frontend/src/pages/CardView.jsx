import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import QRCode from "qrcode";
import MapView from "../components/MapView.jsx";
import DigipinPlate from "../components/DigipinPlate.jsx";
import { api } from "../lib/api.js";
import { formatWhen, timeLeft } from "../lib/format.js";

const PRESETS = [2, 24, 72];
const linkFor = (token) => `${window.location.origin}/s/${token}`;

function StatusPill({ status }) {
  const text = { live: "Live", expired: "Expired", revoked: "Revoked" }[status];
  return <span className={`pill pill-${status}`}>{text}</span>;
}

function ShareRow({ share, onRevoked, openQr, qrOpen }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState("");
  const [err, setErr] = useState("");
  const url = linkFor(share.token);

  async function send() {
    const text = `My address for ${share.label}: ${url}`;
    try {
      if (navigator.share) await navigator.share({ title: "My address (PataCard)", text, url });
      else { await navigator.clipboard.writeText(url); setSent("Link copied"); setTimeout(() => setSent(""), 1500); }
    } catch { /* share sheet closed */ }
  }

  async function revoke() {
    setBusy(true);
    try { await api.revokeShare(share.token); onRevoked(share.token); } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <li className="share">
      <div className="share-main">
        <span className={`share-name ${share.status === "revoked" ? "struck" : ""}`}>{share.label}</span>
        <StatusPill status={share.status} />
        <span className="muted small code-num">
          {share.status === "live" ? `expires in ${timeLeft(share.expiresAt)}` : share.status === "revoked" ? "access ended" : "time ran out"}
        </span>
      </div>
      {share.status === "live" && !confirming && (
        <div className="share-actions">
          <button type="button" className="btn-chip" onClick={send}>{sent || "Send link"}</button>
          <button type="button" className="btn-chip" onClick={() => openQr(qrOpen ? null : share.token)} aria-expanded={qrOpen}>QR</button>
          <button type="button" className="btn-text" onClick={() => setConfirming(true)}>Revoke</button>
        </div>
      )}
      {confirming && share.status === "live" && (
        <div className="confirm" role="group" aria-label={`Revoke ${share.label}`}>
          <span>Revoke the link for {share.label}? It stops working right away.</span>
          <div className="share-actions">
            <button type="button" className="btn-danger" disabled={busy} onClick={revoke}>{busy ? "Revoking…" : "Revoke link"}</button>
            <button type="button" className="btn-chip" onClick={() => setConfirming(false)}>Keep it</button>
          </div>
        </div>
      )}
      {qrOpen && share.status === "live" && <QrPanel url={url} label={share.label} />}
      {err && <p className="error small" role="alert">{err}</p>}
    </li>
  );
}

function QrPanel({ url, label }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 440, color: { dark: "#16202B", light: "#FFFFFF" } }).then(setSrc);
  }, [url]);
  return (
    <div className="qr">
      {src && <img src={src} width="220" height="220" alt={`QR code for the ${label} link`} />}
      <p className="muted small">Scan to open the address for {label}. No app needed.</p>
    </div>
  );
}

export default function CardView() {
  const { id } = useParams();
  const { state } = useLocation();
  const [card, setCard] = useState(null);
  const [shares, setShares] = useState([]);
  const [access, setAccess] = useState([]);
  const [error, setError] = useState("");
  const [photoOk, setPhotoOk] = useState(true);
  const [label, setLabel] = useState("");
  const [hours, setHours] = useState(24);
  const [custom, setCustom] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [qrFor, setQrFor] = useState(null);

  const load = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([api.getCard(id), api.listAccess(id)]);
      setCard(c.card);
      setShares([...c.shares].sort((x, y) => (y.createdAt || "").localeCompare(x.createdAt || "")));
      setAccess(a.access);
    } catch (e) { setError(e.message); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function createLink(e) {
    e.preventDefault();
    setCreating(true);
    setFormErr("");
    try {
      const { share } = await api.createShare(id, { label: label.trim(), hours: Number(hours) });
      setShares((s) => [{ ...share, createdAt: new Date().toISOString() }, ...s]);
      setQrFor(share.token);
      setLabel("");
    } catch (err) { setFormErr(err.message); }
    setCreating(false);
  }

  function revoked(token) {
    setShares((s) => s.map((x) => (x.token === token ? { ...x, status: "revoked" } : x)));
    if (qrFor === token) setQrFor(null);
  }

  if (error) return <main className="page"><p className="error" role="alert">{error}</p><Link to="/cards">Back to my cards</Link></main>;
  if (!card) return <main className="page"><div className="skeleton" style={{ height: 240 }} /></main>;

  const live = shares.filter((s) => s.status === "live").length;

  return (
    <div className="split">
      <section className="split-map">
        <MapView pin={{ lat: card.lat, lon: card.lon }} zoom={17} className="map-short" />
      </section>

      <section className="split-panel">
        <div className="panel-head">
          <h1>{card.landmark || "My address card"}</h1>
          {state?.created && <p className="notice">Card saved. Now make a link for each person who needs your address.</p>}
          {state?.notice && <p className="error" role="alert">{state.notice}</p>}
        </div>

        <DigipinPlate code={card.digipin} />

        <div className="place">
          {card.photoUrl && photoOk && (
            <img className="door" src={card.photoUrl} alt="Door photo" onError={() => setPhotoOk(false)} />
          )}
          <div>
            <span className="field-label">Landmark</span>
            <p className="place-text">{card.landmark || <span className="muted">No landmark added</span>}</p>
          </div>
        </div>

        <section className="block" aria-labelledby="links-h">
          <div className="block-head">
            <h2 id="links-h">Share links</h2>
            <span className="muted small">{live} live</span>
          </div>
          {shares.length === 0
            ? <p className="muted">No links yet. Create one for each person who needs your address.</p>
            : (
              <ul className="shares">
                {shares.map((s) => (
                  <ShareRow key={s.token} share={s} onRevoked={revoked} qrOpen={qrFor === s.token} openQr={setQrFor} />
                ))}
              </ul>
            )}
        </section>

        <form className="block new-link" onSubmit={createLink}>
          <h2>New link</h2>
          <div className="field">
            <label htmlFor="who" className="field-label">Who is this for?</label>
            <input id="who" className="input" maxLength={40} required value={label}
              placeholder="Ambulance, Flipkart delivery, Ravi (guest)" onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="field">
            <span className="field-label" id="hours-l">Works for</span>
            <div className="chips" role="group" aria-labelledby="hours-l">
              {PRESETS.map((h) => (
                <button type="button" key={h} className={`chip ${!custom && hours === h ? "on" : ""}`} aria-pressed={!custom && hours === h}
                  onClick={() => { setCustom(false); setHours(h); }}>{h} h</button>
              ))}
              <button type="button" className={`chip ${custom ? "on" : ""}`} aria-pressed={custom} onClick={() => setCustom(true)}>Custom</button>
            </div>
            {custom && (
              <label className="custom-hours">
                <input type="number" className="input input-narrow" min={1} max={168} step={1} value={hours}
                  onChange={(e) => setHours(e.target.value)} /> hours (1 to 168)
              </label>
            )}
          </div>
          {formErr && <p className="error" role="alert">{formErr}</p>}
          <button type="submit" className="btn-primary" disabled={creating || !label.trim()}>
            {creating ? "Creating…" : "Create link"}
          </button>
        </form>

        <section className="block" aria-labelledby="log-h">
          <div className="block-head">
            <h2 id="log-h">Who opened it</h2>
            <button type="button" className="btn-text" onClick={load}>Refresh</button>
          </div>
          {access.length === 0
            ? <p className="muted">Nobody has opened a link yet.</p>
            : (
              <ol className="log">
                {access.map((a) => (
                  <li key={a.openedAt + a.label}>
                    <span>{a.label}</span>
                    <time className="muted code-num" dateTime={a.openedAt}>{formatWhen(a.openedAt)}</time>
                  </li>
                ))}
              </ol>
            )}
        </section>
      </section>
    </div>
  );
}
