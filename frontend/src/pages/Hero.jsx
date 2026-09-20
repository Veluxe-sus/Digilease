import { useRef } from "react";
import { Link } from "react-router-dom";
import ShapeGrid from "../components/reactbits/ShapeGrid.jsx";
import BentoGrid, { BentoCard } from "../components/reactbits/MagicBento.jsx";
import BlurText from "../components/reactbits/BlurText.jsx";
import SiteNav from "../components/SiteNav.jsx";
import LanyardPass from "../components/LanyardPass.jsx";
import useReveal from "../lib/useReveal.js";

// Eight cells, eight things the app actually does. Two of them carry real
// screenshots of the shipped product; nothing here is a claim the code cannot back.
const FEATURES = [
  {
    span: "span-2x2",
    shot: "/shots/offline-map.png",
    alt: "The saved page open in airplane mode, showing streets, the route and the distance left",
    title: "Works with no signal",
    body: "Once the page has been opened once, it keeps working. In airplane mode the receiver still sees the streets around the door, the route, their own dot and how far is left.",
  },
  {
    span: "span-1x2",
    shot: "/shots/receiver-online.png",
    alt: "A receiver opening a share link on a phone",
    title: "No app, no account",
    body: "Whoever you send it to opens a link. That is the whole thing.",
  },
  {
    title: "One link per person",
    body: "A separate link for the ambulance, the rider and the guest. They never see each other.",
  },
  {
    title: "Choose how long it lasts",
    body: "Two hours, a day, three days, no expiry, or any number of hours up to a week.",
  },
  {
    title: "See who opened it",
    body: "Every open is logged against the link it came in on, with the time.",
  },
  {
    title: "Revoke in one tap",
    body: "Online views stop immediately. Nothing to ask back, nothing to delete from a chat.",
  },
  {
    title: "Landmark and door photo",
    body: "Say it the way you would on the phone, and show the gate they are looking for.",
  },
  {
    title: "A card for the gate",
    body: "Print the link as an A6 card with its QR code, for the door or an invitation.",
  },
];

const STEPS = [
  { title: "Drop a pin", body: "On your door, by GPS or by dragging. The DIGIPIN updates as you move it." },
  { title: "Make a link", body: "Name who it is for and how long it should last. You get a link and a QR code." },
  { title: "They find the door", body: "They open it, see the spot, the landmark and the photo, and get a route." },
];

export default function Hero() {
  const root = useRef(null);
  useReveal(root);

  return (
    <div className="hero-page" ref={root}>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true">
          <ShapeGrid
            speed={0.35}
            squareSize={48}
            direction="diagonal"
            borderColor="rgba(217, 207, 168, 0.55)"
            hoverFillColor="#B05A28"
            hoverTrailAmount={5}
          />
        </div>

        <SiteNav />

        <div className="hero-inner">
          <div className="hero-copy">
            <BlurText
              as="h1"
              className="hero-title hero-title-words"
              text="An address you can hand over, and take back."
              delay={55}
              stepDuration={0.28}
            />
            <p className="hero-lede">
              DIGIPIN names every 3.8 m of India. DigiLease lets you share yours one person at a time.
            </p>
            <div className="hero-cta">
              <Link to="/cards" className="btn-primary">Make my card</Link>
              <a href="#how" className="btn-secondary">How it works</a>
            </div>
          </div>

          <div className="hero-pass">
            <LanyardPass />
          </div>
        </div>
      </section>

      <section className="band reveal" id="who">
        {/* TODO(vansh): your words. This is drafted from README facts only. */}
        <h2 className="band-title">Who made this</h2>
        <p className="band-text">
          DigiLease was built for the WeMakeDevs x AWS First Commit hackathon, Ship It track. The problem
          comes from the Digital Address DPI Innovation Hackathon run by Shaastra 2026 at IIT Madras with
          India Post: a digital address is only useful if people can actually hand it out.
        </p>
      </section>

      <section className="band reveal" id="what">
        <h2 className="band-title">What DigiLease is</h2>
        <div className="band-cols">
          <p className="band-text">
            India&rsquo;s PIN code stops at the locality, so addresses run on landmarks and a driver ends up
            on the phone at the gate. India Post&rsquo;s DIGIPIN fixes the precision: every square of about
            3.8 m in the country has its own ten-character code, like <span className="code">4T3 96F4 2L7</span>.
          </p>
          <p className="band-text">
            What it does not have is consent. There is no way to say who sees your code, for how long, and
            to take it back afterwards. DigiLease is that missing layer, and nothing more.
          </p>
        </div>
      </section>

      <section className="band reveal" id="features">
        <h2 className="band-title">What it does</h2>
        <BentoGrid>
          {FEATURES.map((f) => (
            <BentoCard key={f.title} span={f.span || ""} className={f.shot ? "bento-card--shot" : ""}>
              {f.shot && <img src={f.shot} alt={f.alt} loading="lazy" />}
              <div className={f.shot ? "bento-card__text" : ""}>
                <h3 className="bento-card__title">{f.title}</h3>
                <p className="bento-card__body">{f.body}</p>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>

        <p className="limits">
          What it cannot do: a receiver can screenshot what they saw, and an offline copy keeps working on
          their phone until it next goes online. Revoking stops every online view at once.
        </p>

        <Link to="/cards" className="btn-primary band-cta">Make my card</Link>
      </section>

      <section className="band reveal" id="how">
        <h2 className="band-title">How it works</h2>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="closer reveal">
        <h2 className="closer-title">Your door, on your terms.</h2>
        <Link to="/cards" className="btn-primary">Make my card</Link>
        <p className="muted small closer-note">
          DIGIPIN by India Post. Offline streets &copy; OpenStreetMap contributors.
        </p>
      </section>
    </div>
  );
}
