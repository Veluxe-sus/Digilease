import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { api } from "../lib/api.js";
import { formatDigipin, formatPrintExpiry } from "../lib/format.js";

export default function PrintCard() {
  const { id, token } = useParams();
  const [card, setCard] = useState(null);
  const [share, setShare] = useState(null);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.getCard(id).then(({ card: foundCard, shares }) => {
      if (!active) return;
      const foundShare = shares.find((item) => item.token === token && item.status === "live");
      if (!foundShare) setError("This link cannot be printed because it is missing or no longer live.");
      else { setCard(foundCard); setShare(foundShare); }
    }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [id, token]);

  useEffect(() => {
    if (!share) return;
    const url = `${window.location.origin}/s/${token}`;
    QRCode.toDataURL(url, { margin: 4, width: 700, color: { dark: "#26301C", light: "#FFFFFF" } })
      .then(setQr).catch(() => setError("The QR code could not be made. Try again."));
  }, [share, token]);

  if (error) {
    return <main className="page"><p className="error" role="alert">{error}</p><Link to={`/card/${id}`}>Back to card</Link></main>;
  }
  if (!card || !share || !qr) {
    return <main className="page"><div className="skeleton" style={{ height: 520 }} /></main>;
  }

  return (
    <main className="print-page">
      <div className="print-controls">
        <Link to={`/card/${id}`} className="btn-text">← Back to card</Link>
        <h1>Print card</h1>
      </div>

      <article className="print-card" aria-label={`Printable address card for ${share.label}`}>
        <header className="print-card-head">
          <strong>DigiLease</strong>
          <span>Address pass</span>
        </header>

        <div className="print-recipient">
          <span>Private link for</span>
          <strong>{share.label}</strong>
          <span className="print-dot-field" aria-hidden="true" />
        </div>

        {card.photoUrl && <img className="print-photo" src={card.photoUrl} alt="Door" />}

        <div className="print-scan">
          <img className="print-qr" src={qr} alt={`QR code for ${share.label}`} />
          <div className="print-scan-copy">
            <span className="print-step">Scan</span>
            <strong>Scan to find the door</strong>
            <p>Open it once with internet. Near us it keeps working without signal.</p>
          </div>
        </div>

        <div className="print-digipin">
          <span>DIGIPIN</span>
          <strong>{formatDigipin(card.digipin)}</strong>
        </div>

        <div className="print-pass-meta">
          <div>
            <span>Landmark</span>
            <strong className="print-landmark">{card.landmark || "No landmark added"}</strong>
          </div>
          <div>
            <span>Link access</span>
            <strong>{formatPrintExpiry(share.expiresAt) || "No expiry"}</strong>
          </div>
        </div>

        <footer className="print-card-foot">
          <span>Private share link</span>
          <span>DIGIPIN by India Post</span>
        </footer>
      </article>

      <div className="print-controls print-actions">
        <button type="button" className="btn-primary btn-block" onClick={() => window.print()}>Print / Save as PDF</button>
        <p className="muted small print-helper">Prints at A6 (postcard size). Choose “Save as PDF” in the print dialog to get a file.</p>
      </div>
    </main>
  );
}
