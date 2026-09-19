// MapLibre map on Amazon Location's v2 "Standard" style, Indian political view.
// The browser key only allows map tiles, and only from our domains (see template.yaml).
import { useEffect, useRef } from "react";
import { Map as MapLibre, Marker, LngLatBounds, NavigationControl, setWorkerUrl } from "maplibre-gl";

// MapLibre v6 finds its worker next to its own module, which breaks once Vite bundles it.
// `npm run copy-map-worker` (runs before dev/build) serves the worker + its shared chunk from /maplibre/.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const REGION = import.meta.env.VITE_REGION;
const KEY = import.meta.env.VITE_MAP_API_KEY;
const STYLE = `https://maps.geo.${REGION}.amazonaws.com/v2/styles/Standard/descriptor?key=${KEY}&political-view=IND`;

function pinElement() {
  const el = document.createElement("div");
  el.className = "map-pin";
  el.setAttribute("aria-label", "Door location");
  return el;
}

function youElement() {
  const el = document.createElement("div");
  el.className = "map-you";
  el.setAttribute("aria-label", "Your location");
  return el;
}

/**
 * pin: { lat, lon } | null      draggable: owner can move it (drag or tap the map)
 * onPinChange({ lat, lon })     zoom: initial zoom
 * route: [[lon, lat], ...]      you: { lat, lon } for the receiver's position
 * focus: { lat, lon, zoom? }    a new object flies the camera there
 */
export default function MapView({ pin, onPinChange, draggable = false, zoom = 16, route, you, focus, className = "" }) {
  const box = useRef(null);
  const map = useRef(null);
  const pinMarker = useRef(null);
  const youMarker = useRef(null);
  const onChange = useRef(onPinChange);
  onChange.current = onPinChange;

  // Create the map once.
  useEffect(() => {
    const start = pin ? [pin.lon, pin.lat] : [79.0, 22.5];
    const m = new MapLibre({ container: box.current, style: STYLE, center: start, zoom: pin ? zoom : 4, validateStyle: false });
    m.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    if (draggable) {
      m.on("click", (e) => onChange.current?.({ lat: e.lngLat.lat, lon: e.lngLat.lng }));
    }
    map.current = m;
    if (import.meta.env.DEV) window.__pataMap = m; // dev-only handle for debugging in the console
    return () => m.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the pin marker in sync with props.
  useEffect(() => {
    const m = map.current;
    if (!m || !pin) return;
    if (!pinMarker.current) {
      pinMarker.current = new Marker({ element: pinElement(), anchor: "bottom", draggable })
        .setLngLat([pin.lon, pin.lat])
        .addTo(m);
      pinMarker.current.on("dragend", () => {
        const p = pinMarker.current.getLngLat();
        onChange.current?.({ lat: p.lat, lon: p.lng });
      });
    } else {
      pinMarker.current.setLngLat([pin.lon, pin.lat]);
    }
  }, [pin, draggable]);

  // Receiver's own position.
  useEffect(() => {
    const m = map.current;
    if (!m || !you) return;
    if (!youMarker.current) youMarker.current = new Marker({ element: youElement() }).setLngLat([you.lon, you.lat]).addTo(m);
    else youMarker.current.setLngLat([you.lon, you.lat]);
  }, [you]);

  // Route line, drawn once the style is ready.
  useEffect(() => {
    const m = map.current;
    if (!m || !route || route.length < 2) return;
    const draw = () => {
      const data = { type: "Feature", geometry: { type: "LineString", coordinates: route } };
      if (m.getSource("route")) m.getSource("route").setData(data);
      else {
        m.addSource("route", { type: "geojson", data });
        m.addLayer({
          id: "route", type: "line", source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#1F6FB2", "line-width": 5, "line-opacity": 0.9 },
        });
      }
      const bounds = route.reduce((b, c) => b.extend(c), new LngLatBounds(route[0], route[0]));
      m.fitBounds(bounds, { padding: 56, maxZoom: 17 });
    };
    if (m.isStyleLoaded()) draw();
    else m.once("load", draw);
  }, [route]);

  // Fly the camera when the parent asks (e.g. after "Use my location").
  useEffect(() => {
    if (map.current && focus) map.current.flyTo({ center: [focus.lon, focus.lat], zoom: focus.zoom ?? 18 });
  }, [focus]);

  return <div ref={box} className={`map ${className}`} />;
}
