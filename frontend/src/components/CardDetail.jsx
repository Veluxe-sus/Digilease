// One card, opened. Rendered two ways: on its own route at /card/:id, and as the
// right-hand panel beside the stack on /cards. The share rows are tear stubs: a
// revoked one stays on the card, struck through, because seeing the dead stub is
// the point of the product.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import MapView from "./MapView.jsx";
import DigipinPlate from "./DigipinPlate.jsx";
import { api } from "../lib/api.js";
import { formatWhen, timeLeft } from "../lib/format.js";

const PRESETS = [2, 24, 72, 0];
const linkFor = (token) => `${window.location.origin}/s/${token}`;

function StatusPill({ status }) {
  const text = { live: "Live", expired: "Expired", revoked: "Revoked" }[status];
  return <span className={`pill pill-${status}`}>{text}</span>;
}

function QrPanel({ url, label, printUrl }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 440, color: { dark: "#26301C", light: "#FFFFFF" } }).then(setSrc);
  }, [url]);
  return (
    <div className="qr">
      {src && <img src={src} width="200" height="200" alt={`QR code for the ${label} link`} />}
      <p className="muted small">Scan to open the address for {label}. No app needed.</p>
      <Link className="btn-secondary btn-sm" to={printUrl}>Print card</Link>
    </div>
  );
}

function TearStub({ share, cardId, onRevoked, openQr, qrOpen }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState("");
  const [err, setErr] = useState("");
  const url = linkFor(share.token);

  async function send() {
    const text = `My address for ${share.label}: ${url}`;
    try {
      if (navigator.share) await navigator.share({ title: "My address (DigiLease)", text, url });
      else {
        await navigator.clipboard.writeText(url);
        setSent("Link copied");
        setTimeout(() => setSent(""), 1500);
      }
    } catch { /* share sheet closed */ }
  }

  async function revoke() {
    setBusy(true);
    try {
      await api.revokeShare(share.token);
      onRevoked(share.token);
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <li className={`stub stub-${share.status}`}>
      <div className="stub-main">
        <span className="stub-name">{share.label}</span>
        <StatusPill status={share.status} />
        <span className="muted small code-num">
          {share.status === "live"
            ? share.expiresAt == null ? "No expiry" : `${timeLeft(share.expiresAt)} left`
            : share.status === "revoked" ? "access ended" : "time ran out"}
        </span>
      </div>

      {share.status === "live" && !confirming && (
        <div className="stub-actions">
          <button type="button" className="btn-chip" onClick={send}>{sent || "Send link"}</button>
          <button type="button" className="btn-chip" onClick={() => openQr(qrOpen ? null : share.token)} aria-expanded={qrOpen}>QR</button>
          <Link className="btn-chip" to={`/card/${cardId}/print/${share.token}`}>Print</Link>
          <button type="button" className="btn-text btn-text-danger" onClick={() => setConfirming(true)}>Revoke</button>
        </div>
      )}

      {confirming && share.status === "live" && (
        <div className="confirm" role="group" aria-label={`Revoke ${share.label}`}>
          <span>Revoke the link for {share.label}? It stops working right away.</span>
          <div className="stub-actions">
            <button type="button" className="btn-danger" disabled={busy} onClick={revoke}>{busy ? "Revoking…" : "Revoke link"}</button>
            <button type="button" className="btn-chip" onClick={() => setConfirming(false)}>Keep it</button>
          </div>
        </div>
      )}

      {qrOpen && share.status === "live" && (
        <QrPanel url={url} label={share.label} printUrl={`/card/${cardId}/print/${share.token}`} />
      )}
      {err && <p className="error small" role="alert">{err}</p>}
    </li>
  );
}

export default function CardDetail({ id, showMap = false, notice, created, onBack }) {
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

  useEffect(() => { setCard(null); setError(""); load(); }, [load]);

  async function createLink(e) {
    e.preventDefault();
    // An empty custom field would become 0, which means "No expiry". Never by accident.
    const h = Number(hours);
    if (custom && (String(hours).trim() === "" || !Number.isInteger(h) || h < 1 || h > 168)) {
      setFormErr("Enter a whole number of hours from 1 to 168.");
      return;
    }
    setCreating(true);
    setFormErr("");
    try {
      const { share } = await api.createShare(id, { label: label.trim(), hours: h });
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

  if (error) {
    return (
      <section className="detail">
        <p className="error" role="alert">{error}</p>
        <Link to="/cards">Back to my cards</Link>
      </section>
    );
  }
  if (!card) return <section className="detail"><div className="skeleton" style={{ height: 320 }} /></section>;

  const live = shares.filter((s) => s.status === "live").length;

  return (
    <section className="detail">
      {onBack && (
        <button type="button" className="btn-text back-link" onClick={onBack}>Back to the stack</button>
      )}

      {showMap && (
        <MapView pin={{ lat: card.lat, lon: card.lon }} zoom={17} className="map-short detail-map" />
      )}

      <div className="panel-head">
        <h1>{card.landmark || "My address card"}</h1>
        {created && <p className="notice">Card saved. Now make a link for each person who needs your address.</p>}
        {notice && <p className="error" role="alert">{notice}</p>}
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
            <ul className="stubs">
              {shares.map((s) => (
                <TearStub key={s.token} share={s} cardId={id} onRevoked={revoked} qrOpen={qrFor === s.token} openQr={setQrFor} />
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
                onClick={() => { setCustom(false); setHours(h); }}>{h === 0 ? "No expiry" : `${h} h`}</button>
            ))}
            <button type="button" className={`chip ${custom ? "on" : ""}`} aria-pressed={custom}
              onClick={() => { setCustom(true); if (hours === 0) setHours(24); }}>Custom</button>
          </div>
          {custom && (
            <label className="custom-hours">
              <input type="number" className="input input-narrow" required min={1} max={168} step={1} value={hours}
                onChange={(e) => setHours(e.target.value)} /> hours (1 to 168)
            </label>
          )}
          <span className="muted small">Receivers can keep an offline copy until the link expires.</span>
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
  );
}
