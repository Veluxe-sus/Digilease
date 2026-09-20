// React Bits <BlurText />. https://reactbits.dev
// Adapted for semantic headings, reduced motion, and this non-Tailwind project.
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

function buildKeyframes(from, steps) {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))]);
  return Object.fromEntries([...keys].map((key) => [key, [from[key], ...steps.map((step) => step[key])]]));
}

export default function BlurText({
  text = "",
  delay = 70,
  className = "",
  animateBy = "words",
  direction = "bottom",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = [0.22, 1, 0.36, 1],
  onAnimationComplete,
  stepDuration = 0.28,
  as: Tag = "p",
}) {
  const elements = useMemo(
    () => (animateBy === "words" ? text.trim().split(/\s+/) : [...text]),
    [animateBy, text],
  );
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion) {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.unobserve(element);
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reduceMotion, rootMargin, threshold]);

  const defaultFrom = useMemo(
    () => ({ filter: "blur(8px)", opacity: 0, y: direction === "top" ? -22 : 22 }),
    [direction],
  );
  const defaultTo = useMemo(
    () => [
      { filter: "blur(3px)", opacity: 0.62, y: direction === "top" ? 3 : -3 },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction],
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const finalSnapshot = toSnapshots.at(-1) ?? {};
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, index) => index / Math.max(stepCount - 1, 1));
  const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

  return (
    <Tag ref={ref} className={`blur-text ${className}`.trim()} aria-label={text}>
      {elements.map((segment, index) => (
        <motion.span
          className="blur-text__segment"
          key={`${segment}-${index}`}
          aria-hidden="true"
          initial={reduceMotion ? finalSnapshot : fromSnapshot}
          animate={reduceMotion ? finalSnapshot : inView ? animateKeyframes : fromSnapshot}
          transition={{
            duration: reduceMotion ? 0 : totalDuration,
            times,
            delay: reduceMotion ? 0 : (index * delay) / 1000,
            ease: easing,
          }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
        >
          {segment === " " ? "\u00A0" : segment}
          {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </Tag>
  );
}
