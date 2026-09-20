// One ScrollTrigger for the whole page: every `.reveal` inside the given root
// lifts and fades in once, as it enters. Anything that asked for less motion just
// gets the finished state immediately.
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }

    const ctx = gsap.context(() => {
      targets.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onStart: () => el.classList.add("is-in"),
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, [rootRef]);
}
