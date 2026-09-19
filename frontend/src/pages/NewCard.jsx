import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../components/MapView.jsx";
import DigipinPlate from "../components/DigipinPlate.jsx";
import { getDigiPin } from "../lib/digipin.js";
import { api, uploadPhoto } from "../lib/api.js";
import { locationError } from "../lib/format.js";

const MAX_LANDMARK = 200;
const MAX_PHOTO = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png"];

export default function NewCard() {
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [focus, setFocus] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [locating, setLocating] = useState(false);
  const [landmark, setLandmark] = useState("");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const code = useMemo(() => {
    if (!pin) return "";
    try { return getDigiPin(pin.lat, pin.lon); } catch { return null; }
  }, [pin]);
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : ""), [photo]);

  function movePin(p) {
    if (!pin) setFocus({ ...p, zoom: 17 }); // first tap on the India overview: zoom in to street level
    setPin(p);
    setAccuracy(null);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return setError("This browser can't share its location. Tap the map instead.");
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setPin(p);
        setFocus({ ...p, zoom: 18 });
        setAccuracy(Math.round(pos.coords.accuracy));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setError(locationError(err, "tap the map where your door is"));
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function pickPhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!TYPES.includes(f.type)) return setError("Door photo must be a JPEG or PNG.");
    if (f.size > MAX_PHOTO) return setError("Door photo must be 5 MB or smaller.");
    setError("");
    setPhoto(f);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const { card, upload } = await api.createCard({
        lat: pin.lat, lon: pin.lon, landmark: landmark.trim(), ...(photo ? { photoType: photo.type } : {}),
      });
      let notice = "";
      if (upload && photo) {
        try { await uploadPhoto(upload, photo); } catch (e) { notice = e.message; }
      }
      navigate(`/card/${card.cardId}`, { state: { notice, created: true } });
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  const canSave = pin && code && !saving;

  return (
    <div className="split">
      <section className="split-map">
        <MapView pin={pin} onPinChange={movePin} draggable focus={focus} className="map-tall" />
        <div className="map-tools">
          <button type="button" className="btn-secondary btn-sm" onClick={useMyLocation} disabled={locating}>
            {locating ? "Finding you…" : "Use my location"}
          </button>
          {accuracy != null && <span className="map-chip">GPS accuracy ±{accuracy} m</span>}
          {!pin && <span className="map-chip">Tap the map where your door is</span>}
          {pin && accuracy == null && <span className="map-chip">Drag the pin onto your door</span>}
        </div>
      </section>

      <section className="split-panel">
        <div className="panel-head">
          <h1>New address card</h1>
          <p className="muted">Your DIGIPIN points to a square of about 3.8 m. Add what a stranger needs to find your door.</p>
        </div>

        <DigipinPlate code={code || ""} label="Your DIGIPIN" large />
        {code === null && <p className="error" role="alert">That spot is outside India's DIGIPIN area. Move the pin inside India.</p>}
        {code && <p className="muted small">Updates as you move the pin.</p>}

        <div className="field">
          <label htmlFor="landmark" className="field-label">Landmark</label>
          <input id="landmark" className="input" maxLength={MAX_LANDMARK} value={landmark}
            placeholder="Blue gate, behind Hanuman temple, 2nd lane"
            onChange={(e) => setLandmark(e.target.value)} />
          <div className="field-foot">
            <span className="muted small">What a rider sees at the gate.</span>
            <span className="muted small code-num">{landmark.length} / {MAX_LANDMARK}</span>
          </div>
        </div>

        <div className="field">
          <span className="field-label">Door photo</span>
          <label className={`dropzone ${preview ? "has-photo" : ""}`} htmlFor="photo">
            {preview
              ? <img src={preview} alt="Your door" />
              : <span>Add a photo of your door<br /><span className="muted small">JPEG or PNG, up to 5 MB</span></span>}
          </label>
          <input id="photo" type="file" accept="image/jpeg,image/png" capture="environment" className="visually-hidden" onChange={pickPhoto} />
          {photo && <button type="button" className="btn-text" onClick={() => setPhoto(null)}>Remove photo</button>}
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="action-bar">
          <button type="button" className="btn-primary btn-block" disabled={!canSave} onClick={save}>
            {saving ? "Saving…" : "Save card"}
          </button>
        </div>
      </section>
    </div>
  );
}
