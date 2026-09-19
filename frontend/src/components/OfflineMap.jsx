// The last-km map drawn entirely on the phone: saved OpenStreetMap streets, the 1 km square,
// the saved route, the door and the receiver. No tiles, no glyphs, so nothing needs the network.
import { useEffect, useRef, useState } from "react";
import { Map as MapLibre, Marker, LngLatBounds, setWorkerUrl } from "maplibre-gl";
import { getDigiPin, getLatLngFromDigiPin } from "../lib/digipin.js";
import { alongRoute, distanceMeters, insideBox } from "../lib/geo.js";
import { formatDigipin, formatDistance } from "../lib/format.js";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const ARRIVED_METRES = 15;
const STYLE = { version: 8, sources: {}, layers: [{ id: "paper", type: "background", paint: { "background-color": "#F4F6F8" } }] };
const MAIN = ["motorway", "trunk", "primary", "secondary", "tertiary"].flatMap((k) => [k, `${k}_link`]);
const PATHS = ["footway", "path", "pedestrian", "steps", "cycleway", "track", "bridleway", "corridor"];
const isPath = ["in", ["get", "kind"], ["literal", PATHS]];
const EMPTY = { type: "FeatureCollection", features: [] };

const line = (coordinates) => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } });

function squareOutline(b) {
  return line([[b.west, b.south], [b.east, b.south], [b.east, b.north], [b.west, b.north], [b.west, b.south]]);
}

function accuracyCircle(p, metres) {
  const kLat = 111_195;
  const kLon = kLat * Math.cos((p.lat * Math.PI) / 180);
  const ring = Array.from({ length: 33 }, (_, i) => {
    const a = (i / 32) * 2 * Math.PI;
    return [p.lon + (metres * Math.sin(a)) / kLon, p.lat + (metres * Math.cos(a)) / kLat];
  });
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
}

function marker(className, label) {
  const el = document.createElement("div");
  el.className = className;
  el.setAttribute("aria-label", label);
  return el;
}

function codeFor(p) {
  try {
    return getDigiPin(p.lat, p.lon);
  } catch {
    return null; // outside India's DIGIPIN area
  }
}

/** card: {lat, lon, digipin, landmark}   area: {box, streets} | null   route: [[lon, lat], ...] | null */
export default function OfflineMap({ card, area, route, photoUrl }) {
  const box = useRef(null);
  const map = useRef(null);
  const youMarker = useRef(null);
  const [ready, setReady] = useState(false);
  const [pos, setPos] = useState(null);
  const [geo, setGeo] = useState("waiting"); // waiting | ok | denied
  const [bigPhoto, setBigPhoto] = useState(false);

  useEffect(() => {
    const m = new MapLibre({ container: box.current, style: STYLE, center: [card.lon, card.lat], zoom: 16, attributionControl: false });
    m.on("load", () => {
      m.addSource("streets", {
        type: "geojson",
        data: { type: "FeatureCollection", features: (area?.streets || []).map((s) => ({ ...line(s.line), properties: { kind: s.kind } })) },
      });
      m.addSource("square", { type: "geojson", data: area ? squareOutline(area.box) : EMPTY });
      m.addSource("route", { type: "geojson", data: route?.length > 1 ? line(route) : EMPTY });
      m.addSource("accuracy", { type: "geojson", data: EMPTY });
      m.addLayer({
        id: "streets", type: "line", source: "streets", filter: ["!", isPath],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#B9C2CC", "line-width": ["case", ["in", ["get", "kind"], ["literal", MAIN]], 4, 2.5] },
      });
      m.addLayer({ id: "paths", type: "line", source: "streets", filter: isPath, paint: { "line-color": "#B9C2CC", "line-width": 1, "line-dasharray": [3, 2] } });
      m.addLayer({ id: "square", type: "line", source: "square", paint: { "line-color": "#56626F", "line-width": 1.5, "line-dasharray": [4, 3] } });
      m.addLayer({ id: "accuracy", type: "fill", source: "accuracy", paint: { "fill-color": "#1F6FB2", "fill-opacity": 0.1 } });
      m.addLayer({
        id: "route", type: "line", source: "route",
        layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#1F6FB2", "line-width": 4 },
      });
      if (area) m.fitBounds(new LngLatBounds([area.box.west, area.box.south], [area.box.east, area.box.north]), { padding: 16, animate: false });
      setReady(true);
    });
    new Marker({ element: marker("map-pin", "Door location"), anchor: "bottom" }).setLngLat([card.lon, card.lat]).addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      youMarker.current = null;
    };
    // The saved copy doesn't change while this view is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeo("denied");
      return undefined;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy });
        setGeo("ok");
      },
      (err) => { if (err.code === err.PERMISSION_DENIED) setGeo("denied"); }, // timeouts: keep waiting
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 60_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !ready || !pos) return;
    if (!youMarker.current) youMarker.current = new Marker({ element: marker("map-you", "Your location") }).setLngLat([pos.lon, pos.lat]).addTo(m);
    else youMarker.current.setLngLat([pos.lon, pos.lat]);
    m.getSource("accuracy").setData(pos.accuracy ? accuracyCircle(pos, pos.accuracy) : EMPTY);
  }, [pos, ready]);

  const door = { lat: card.lat, lon: card.lon };
  const youCode = pos ? codeFor(pos) : null;
  let straight = null;
  if (youCode) {
    const c = getLatLngFromDigiPin(youCode);
    straight = distanceMeters({ lat: Number(c.latitude), lon: Number(c.longitude) }, door); // cell centre to cell centre
  } else if (pos) {
    straight = distanceMeters(pos, door);
  }
  const inside = !pos || !area || insideBox(pos, area.box);
  const along = pos && inside ? alongRoute(pos, route) : null;

  let distance;
  if (geo === "denied") {
    distance = <p className="offline-note">Allow location to see where you are. The map and the door still show.</p>;
  } else if (!pos) {
    distance = <p className="offline-note">Finding your position. Without data this can take up to a minute.</p>;
  } else if (!inside) {
    distance = (
      <>
        <p className="offline-distance">You're outside the saved area</p>
        <p className="muted">The door is {formatDistance(straight)} away</p>
      </>
    );
  } else if (straight <= ARRIVED_METRES) {
    distance = <p className="offline-distance arrived">You're at the door</p>;
  } else {
    distance = (
      <>
        <p className="offline-distance">{formatDistance(straight)} to the door</p>
        <p className="muted small">straight line</p>
        {along != null && <p className="small">about {formatDistance(along)} along the route</p>}
      </>
    );
  }

  return (
    <main className="offline-view">
      <section className="offline-map" aria-label="Saved street map around the door">
        <div ref={box} className="map" />
      </section>
      <section className="offline-sheet" aria-live="polite">
        {distance}
        <div className="mini-plates">
          <div className="mini-plate plate-you">
            <span className="label">You</span>
            {youCode ? <span className="code-num">{formatDigipin(youCode)}</span> : <span className="skeleton mini-skeleton" />}
          </div>
          <div className="mini-plate plate-door">
            <span className="label">Door</span>
            <span className="code-num">{formatDigipin(card.digipin)}</span>
          </div>
        </div>
        <div className="offline-place">
          <p className="offline-landmark">{card.landmark || <span className="muted">No landmark added</span>}</p>
          {photoUrl && (
            <button type="button" className={`door-thumb ${bigPhoto ? "big" : ""}`} onClick={() => setBigPhoto(!bigPhoto)}
              aria-label={bigPhoto ? "Shrink door photo" : "Enlarge door photo"}>
              <img src={photoUrl} alt="Shared door" />
            </button>
          )}
        </div>
        <p className="credit">Streets © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</p>
      </section>
    </main>
  );
}
