// React Bits <CountUp />. https://reactbits.dev
// The public component is kept intact apart from an explicit reduced-motion exit.
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(direction === "down" ? to : from);
  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  const getDecimalPlaces = (number) => {
    const value = number.toString();
    if (!value.includes(".")) return 0;
    const decimals = value.split(".")[1];
    return parseInt(decimals, 10) === 0 ? 0 : decimals.length;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));
  const formatValue = useCallback((latest) => {
    const hasDecimals = maxDecimals > 0;
    const options = {
      useGrouping: Boolean(separator),
      minimumFractionDigits: hasDecimals ? maxDecimals : 0,
      maximumFractionDigits: hasDecimals ? maxDecimals : 0,
    };
    const formattedNumber = Intl.NumberFormat("en-US", options).format(latest);
    return separator ? formattedNumber.replace(/,/g, separator) : formattedNumber;
  }, [maxDecimals, separator]);

  useEffect(() => {
    if (ref.current) ref.current.textContent = formatValue(direction === "down" ? to : from);
  }, [from, to, direction, formatValue]);

  useEffect(() => {
    if (!isInView || !startWhen) return undefined;
    onStart?.();

    if (reduceMotion) {
      if (ref.current) ref.current.textContent = formatValue(direction === "down" ? from : to);
      onEnd?.();
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      motionValue.set(direction === "down" ? from : to);
    }, delay * 1000);
    const durationTimeoutId = setTimeout(() => onEnd?.(), delay * 1000 + duration * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(durationTimeoutId);
    };
  }, [isInView, startWhen, motionValue, direction, from, to, delay, onStart, onEnd, duration, reduceMotion, formatValue]);

  useEffect(() => springValue.on("change", (latest) => {
    if (ref.current) ref.current.textContent = formatValue(latest);
  }), [springValue, formatValue]);

  return <span className={className} ref={ref} />;
}
