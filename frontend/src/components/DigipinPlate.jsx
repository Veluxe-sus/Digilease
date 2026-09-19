// The DIGIPIN "code plate": the one bold element in the UI. Characters that change
// (as the owner drags the pin) flash briefly so it's obvious the code is live.
import { useEffect, useRef, useState } from "react";

export default function DigipinPlate({ code, label = "DIGIPIN", large = false }) {
  const prev = useRef(code);
  const [changed, setChanged] = useState(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const before = prev.current || "";
    prev.current = code;
    if (!code || !before || before === code) return undefined;
    const diff = new Set([...code].map((c, i) => (c !== before[i] ? i : -1)).filter((i) => i >= 0));
    setChanged(diff);
    const t = setTimeout(() => setChanged(new Set()), 450);
    return () => clearTimeout(t);
  }, [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked: the code is still visible to copy by hand */ }
  }

  return (
    <div className="plate-block">
      <span className="field-label">{label}</span>
      <div className={`plate ${large ? "plate-lg" : ""}`}>
        <span className="plate-code" aria-live="polite" aria-label={code ? `DIGIPIN ${code.split("").join(" ")}` : "No DIGIPIN"}>
          {code
            ? [...code].map((c, i) => (
              <span key={i} className={`${changed.has(i) ? "chg" : ""} ${i === 3 || i === 7 ? "gap" : ""}`}>{c}</span>
            ))
            : "— — —"}
        </span>
        {code && (
          <button type="button" className="btn-icon" onClick={copy} aria-label="Copy DIGIPIN">
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}
