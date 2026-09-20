// React Bits <CardNav />. https://reactbits.dev
// DigiLease edits: the react-icons import is replaced with Phosphor (the only icon
// family in this project), the hardcoded "Get Started" button takes its label and
// action from props, and `brand` lets the caller render a wordmark instead of an
// <img>. Everything else is upstream.
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "@phosphor-icons/react";
import "./CardNav.css";

const CardNav = ({
  brand,
  logo,
  logoAlt = "Logo",
  items,
  links = [],
  utility,
  className = "",
  ease = "power3.out",
  baseColor = "var(--surface)",
  menuColor,
  buttonBgColor,
  buttonTextColor,
  ctaLabel = "Get Started",
  onCta,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content");
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";

        void contentEl.offsetHeight;

        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return 60 + contentHeight + 16;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, "-=0.1");
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      tlRef.current.kill();
      const newTl = createTimeline();
      if (!newTl) return;
      if (isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
        newTl.progress(1);
      }
      tlRef.current = newTl;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i) => (el) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? "open" : ""}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <button
            type="button"
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            aria-expanded={isExpanded}
            style={{ color: menuColor || "var(--ink)" }}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          <div className="logo-container">
            {brand || <img src={logo} alt={logoAlt} className="logo" />}
          </div>

          {/* Desktop keeps its destinations in the open. The expanding cards below
              are the phone's menu, not the only way to reach anything. */}
          {links.length > 0 && (
            <nav className="card-nav-links" aria-label="Sections">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className={l.active ? "on" : ""}
                  aria-current={l.active ? "page" : undefined}
                  onClick={(e) => {
                    if (l.onClick) {
                      e.preventDefault();
                      l.onClick();
                    }
                  }}
                >
                  {l.label}
                </a>
              ))}
            </nav>
          )}

          {utility ? <div className="card-nav-utility">{utility}</div> : null}

          <button
            type="button"
            className="card-nav-cta-button"
            onClick={onCta}
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          >
            {ctaLabel}
          </button>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <a
                    key={`${lnk.label}-${i}`}
                    className="nav-card-link"
                    href={lnk.href}
                    aria-label={lnk.ariaLabel}
                    onClick={(e) => {
                      if (lnk.onClick) {
                        e.preventDefault();
                        lnk.onClick();
                      }
                      toggleMenu();
                    }}
                  >
                    <ArrowUpRight className="nav-card-link-icon" weight="bold" aria-hidden="true" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
