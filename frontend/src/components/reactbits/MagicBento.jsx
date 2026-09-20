// React Bits <MagicBento />. https://reactbits.dev
// DigiLease edits:
//  - takes real children instead of the demo `cardData` array;
//  - the global `:root` block in the upstream CSS is scoped to `.bento-section`,
//    which otherwise fights this project's tokens (it sets `color-scheme`);
//  - the star particles, cursor magnetism and click ripple are dropped. Twelve
//    looping DOM nodes per card communicate nothing about the feature on the card,
//    and the taste rule here is that motion has to mean something. The cursor
//    spotlight and the border glow stay, because they show which cell you are on.
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import "./MagicBento.css";

const MOBILE_BREAKPOINT = 768;
const DEFAULT_GLOW = "176, 90, 40"; // --accent

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

function GlobalSpotlight({ gridRef, disabled, spotlightRadius = 320, glowColor = DEFAULT_GLOW }) {
  useEffect(() => {
    if (disabled || !gridRef?.current) return undefined;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed; width: 700px; height: 700px; border-radius: 50%;
      pointer-events: none; z-index: 3; opacity: 0; transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(${glowColor}, 0.10) 0%, rgba(${glowColor}, 0.05) 25%, transparent 68%);
    `;
    document.body.appendChild(spotlight);

    const handleMouseMove = (e) => {
      const grid = gridRef.current;
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      const cards = grid.querySelectorAll(".bento-card");

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
        cards.forEach((c) => c.style.setProperty("--glow-intensity", "0"));
        return;
      }

      const proximity = spotlightRadius * 0.5;
      const fade = spotlightRadius * 0.75;
      let nearest = Infinity;

      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const distance = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(r.width, r.height) / 2);
        nearest = Math.min(nearest, distance);

        let intensity = 0;
        if (distance <= proximity) intensity = 1;
        else if (distance <= fade) intensity = (fade - distance) / (fade - proximity);

        card.style.setProperty("--glow-x", `${((e.clientX - r.left) / r.width) * 100}%`);
        card.style.setProperty("--glow-y", `${((e.clientY - r.top) / r.height) * 100}%`);
        card.style.setProperty("--glow-intensity", String(intensity));
        card.style.setProperty("--glow-radius", `${spotlightRadius}px`);
      });

      gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1, ease: "power2.out" });
      const target = nearest <= proximity ? 0.8 : nearest <= fade ? ((fade - nearest) / (fade - proximity)) * 0.8 : 0;
      gsap.to(spotlight, { opacity: target, duration: target > 0 ? 0.2 : 0.5, ease: "power2.out" });
    };

    const handleLeave = () => {
      gridRef.current?.querySelectorAll(".bento-card").forEach((c) => c.style.setProperty("--glow-intensity", "0"));
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleLeave);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleLeave);
      spotlight.remove();
    };
  }, [gridRef, disabled, spotlightRadius, glowColor]);

  return null;
}

export function BentoCard({ children, className = "", span = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const off =
      window.innerWidth <= MOBILE_BREAKPOINT ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (off || !el) return undefined;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const rotateX = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -4;
      const rotateY = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 4;
      gsap.to(el, { rotateX, rotateY, duration: 0.2, ease: "power2.out", transformPerspective: 1000 });
    };
    const onLeave = () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <article ref={ref} className={`bento-card ${span} ${className}`.trim()}>
      {children}
    </article>
  );
}

export default function BentoGrid({ children, glowColor = DEFAULT_GLOW, spotlightRadius = 320 }) {
  const gridRef = useRef(null);
  const isMobile = useMobile();
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const disabled = isMobile || still;

  return (
    <>
      <GlobalSpotlight gridRef={gridRef} disabled={disabled} spotlightRadius={spotlightRadius} glowColor={glowColor} />
      <div className="bento-section" ref={gridRef} style={{ "--glow-color": glowColor }}>
        {children}
      </div>
    </>
  );
}
