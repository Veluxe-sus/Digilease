// The one navigation for every route. Wraps React Bits' CardNav and decides what
// it offers from whether somebody is signed in. The expanding cards carry the same
// destinations as the button, because CardNav hides its button under 768px.
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { MoonStars, Sun } from "@phosphor-icons/react";
import CardNav from "./reactbits/CardNav.jsx";
import SquishSwitch from "./reactbits/SquishSwitch.jsx";

const INK = "#26301C";
const INK_SOFT = "#3A4630";
const ACCENT = "#B05A28";

export default function SiteNav({ signedIn: signedInProp, onSignOut, fixed = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // `undefined` means "ask Cognito"; OwnerArea already knows the answer.
  const [detected, setDetected] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.dataset.theme === "dark");

  useEffect(() => {
    if (signedInProp !== undefined) return undefined;
    let alive = true;
    // Failing closed is right here: an unknown visitor is treated as signed out.
    getCurrentUser().then(
      () => alive && setDetected(true),
      () => alive && setDetected(false),
    );
    return () => { alive = false; };
  }, [signedInProp]);

  const signedIn = signedInProp === undefined ? detected : signedInProp;

  const changeTheme = (nextDark) => {
    const theme = nextDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("digilease-theme", theme); } catch { /* Storage may be unavailable. */ }
    setDarkMode(nextDark);
  };

  const brand = (
    <button type="button" className="wordmark-btn" onClick={() => navigate("/")}>
      <span className="wordmark-mark" aria-hidden="true" />
      <span className="wordmark">DigiLease</span>
    </button>
  );

  const items = signedIn
    ? [
        {
          label: "Your cards",
          bgColor: INK,
          textColor: "#FBF7E4",
          links: [
            { label: "My cards", ariaLabel: "Go to my cards", href: "/cards", onClick: () => navigate("/cards") },
            { label: "New card", ariaLabel: "Make a new card", href: "/new", onClick: () => navigate("/new") },
          ],
        },
        {
          label: "About",
          bgColor: INK_SOFT,
          textColor: "#FBF7E4",
          links: [{ label: "What DigiLease is", ariaLabel: "About DigiLease", href: "/", onClick: () => navigate("/") }],
        },
        {
          label: "Account",
          bgColor: ACCENT,
          textColor: "var(--accent-contrast)",
          links: [{ label: "Sign out", ariaLabel: "Sign out", href: "#signout", onClick: onSignOut }],
        },
      ]
    : [
        {
          label: "Product",
          bgColor: INK,
          textColor: "#FBF7E4",
          links: [
            { label: "What it is", ariaLabel: "What DigiLease is", href: "#what" },
            { label: "Features", ariaLabel: "Features", href: "#features" },
          ],
        },
        {
          label: "How it works",
          bgColor: INK_SOFT,
          textColor: "#FBF7E4",
          links: [{ label: "The three steps", ariaLabel: "How it works", href: "#how" }],
        },
        {
          label: "Account",
          bgColor: ACCENT,
          textColor: "var(--accent-contrast)",
          links: [{ label: "Log in", ariaLabel: "Log in", href: "/cards", onClick: () => navigate("/cards") }],
        },
      ];

  const links = signedIn
    ? [
        { label: "My cards", href: "/cards", onClick: () => navigate("/cards"), active: pathname.startsWith("/card") },
        { label: "New card", href: "/new", onClick: () => navigate("/new"), active: pathname === "/new" },
      ]
    : [
        { label: "What it is", href: "#what" },
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how" },
      ];

  const themeSwitch = (
    <span className="theme-toggle" title={darkMode ? "Dark mode" : "Light mode"}>
      {darkMode
        ? <MoonStars className="theme-toggle-icon" weight="fill" aria-hidden="true" />
        : <Sun className="theme-toggle-icon" weight="bold" aria-hidden="true" />}
      <SquishSwitch
        checked={darkMode}
        onChange={changeTheme}
        ariaLabel={darkMode ? "Use light mode" : "Use dark mode"}
        trackColor="var(--paper)"
        trackOnColor="var(--accent)"
        thumbColor="var(--ink)"
        thumbOnColor="var(--surface)"
        width={50}
        height={28}
        radius={14}
        speed={65}
        stretch={28}
        hoverScale={1.03}
        colorDuration={220}
      />
    </span>
  );

  return (
    <CardNav
      brand={brand}
      items={items}
      links={links}
      utility={themeSwitch}
      className={fixed ? "is-fixed" : ""}
      menuColor="var(--ink)"
      ctaLabel={signedIn ? "Sign out" : "Log in"}
      onCta={signedIn ? onSignOut : () => navigate("/cards")}
    />
  );
}
