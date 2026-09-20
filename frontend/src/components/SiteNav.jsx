// The one navigation for every route. Wraps React Bits' CardNav and decides what
// it offers from whether somebody is signed in. The expanding cards carry the same
// destinations as the button, because CardNav hides its button under 768px.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import CardNav from "./reactbits/CardNav.jsx";

const INK = "#26301C";
const INK_SOFT = "#3A4630";
const ACCENT = "#B05A28";

export default function SiteNav({ signedIn: signedInProp, onSignOut, fixed = false }) {
  const navigate = useNavigate();
  // `undefined` means "ask Cognito"; OwnerArea already knows the answer.
  const [detected, setDetected] = useState(false);

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
          textColor: "#FFFFFF",
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
          textColor: "#FFFFFF",
          links: [{ label: "Log in", ariaLabel: "Log in", href: "/cards", onClick: () => navigate("/cards") }],
        },
      ];

  return (
    <CardNav
      brand={brand}
      items={items}
      className={fixed ? "is-fixed" : ""}
      menuColor={INK}
      ctaLabel={signedIn ? "Sign out" : "Log in"}
      onCta={signedIn ? onSignOut : () => navigate("/cards")}
    />
  );
}
