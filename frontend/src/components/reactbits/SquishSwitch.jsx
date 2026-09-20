// React Bits <SquishSwitch />. https://reactbits.dev
import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "motion/react";
import "./SquishSwitch.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const FLOW_SPRING = { stiffness: 320, damping: 40, mass: 0.6 };
const SWELL_SPRING = { stiffness: 520, damping: 34, mass: 0.6 };
const MAX_STRETCH = 0.4;
const STRETCH_SPEED = 600;
const TAP_SLOP = { fine: 4, coarse: 8 };

export default function SquishSwitch({
  checked,
  defaultChecked = false,
  onChange,
  label = "",
  disabled = false,
  trackColor = "#27272a",
  trackOnColor = "#f5f5f5",
  thumbColor = "",
  thumbOnColor = "",
  width = 76,
  height = 38,
  radius = 19,
  speed = 50,
  stretch = 36,
  hoverScale = 1.035,
  colorDuration = 320,
  ariaLabel,
  className = "",
  id,
}) {
  const reduce = useReducedMotion();
  const inset = Math.max(3, Math.round(height * 0.11));
  const thumb = height - inset * 2;
  const min = inset;
  const max = width - inset - thumb;
  const mid = (min + max) / 2;
  const trackRadius = Math.min(radius, height / 2);
  const thumbRadius = Math.max(2, trackRadius - inset);

  const isControlled = checked !== undefined;
  const [inner, setInner] = useState(defaultChecked);
  const on = isControlled ? checked : inner;
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);
  const grip = useRef(null);
  const onRef = useRef(on);
  onRef.current = on;
  const skipClick = useRef(false);
  const autoId = useId();
  const buttonId = id ?? autoId;

  const x = useMotionValue(on ? max : min);
  const flow = useSpring(useVelocity(x), FLOW_SPRING);
  const swell = useSpring(1, SWELL_SPRING);
  const gain = reduce ? 0 : clamp(stretch, 0, 100) / 100;
  const stretchOf = (value) => 1 + Math.min(MAX_STRETCH, Math.abs(value) / STRETCH_SPEED) * gain;
  const scaleX = useTransform([flow, swell], ([value, hover]) => stretchOf(value) * hover);
  const scaleY = useTransform([flow, swell], ([value, hover]) => hover / stretchOf(value));

  const commit = (next) => {
    if (next === onRef.current) return;
    onRef.current = next;
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  useEffect(() => {
    if (dragging) return undefined;
    const target = on ? max : min;
    if (reduce) {
      x.jump(target);
      return undefined;
    }
    const controls = animate(x, target, {
      type: "spring",
      stiffness: 170 - (50 - clamp(speed, 0, 100)) * 1.1,
      damping: 21.5,
      mass: 0.9,
      restDelta: 0.001,
      restSpeed: 0.01,
    });
    return () => controls.stop();
  }, [on, dragging, min, max, speed, reduce, x]);

  const localX = (clientX) => {
    const element = trackRef.current;
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    const scale = rect.width / (element.offsetWidth || rect.width) || 1;
    return (clientX - rect.left) / scale;
  };

  const down = (event) => {
    if (disabled || grip.current || event.button !== 0) return;
    grip.current = {
      id: event.pointerId,
      grab: null,
      moved: false,
      startX: event.clientX,
      onAtPress: onRef.current,
      slop: event.pointerType === "touch" ? TAP_SLOP.coarse : TAP_SLOP.fine,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch { /* Pointer capture is optional. */ }
    setDragging(true);
  };

  const move = (event) => {
    const currentGrip = grip.current;
    if (!currentGrip || currentGrip.id !== event.pointerId) return;
    const local = localX(event.clientX);
    if (currentGrip.grab === null) {
      currentGrip.grab = local - x.get();
      return;
    }
    if (!currentGrip.moved && Math.abs(event.clientX - currentGrip.startX) > currentGrip.slop) {
      currentGrip.moved = true;
    }
    if (!currentGrip.moved) return;
    const nextX = clamp(local - currentGrip.grab, min, max);
    x.set(nextX);
    commit(nextX > mid);
  };

  const up = (event, cancelled) => {
    const currentGrip = grip.current;
    if (!currentGrip || currentGrip.id !== event.pointerId) return;
    grip.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch { /* The pointer may already be released. */ }
    if (cancelled) commit(currentGrip.onAtPress);
    else if (!currentGrip.moved) commit(!onRef.current);
    skipClick.current = true;
    setTimeout(() => { skipClick.current = false; }, 0);
    setDragging(false);
  };

  const click = () => {
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    if (!disabled) commit(!onRef.current);
  };

  return (
    <span className={`squish-switch-root${className ? ` ${className}` : ""}`}>
      <button
        id={buttonId}
        type="button"
        role="switch"
        aria-checked={on}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        className="squish-switch"
        data-on={on ? "" : undefined}
        data-held={dragging ? "" : undefined}
        style={{
          "--ss-w": `${width}px`,
          "--ss-h": `${height}px`,
          "--ss-inset": `${inset}px`,
          "--ss-thumb": `${thumb}px`,
          "--ss-r": `${trackRadius}px`,
          "--ss-thumb-r": `${thumbRadius}px`,
          "--ss-track": trackColor,
          "--ss-track-on": trackOnColor,
          "--ss-thumb-color": thumbColor || `color-mix(in srgb, ${trackOnColor} 19%, ${trackColor})`,
          "--ss-thumb-on": thumbOnColor || trackColor,
          "--ss-fade": `${colorDuration}ms`,
        }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={(event) => up(event, false)}
        onPointerCancel={(event) => up(event, true)}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && !disabled) swell.set(hoverScale);
        }}
        onPointerLeave={() => swell.set(1)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && grip.current) {
            up({ pointerId: grip.current.id, currentTarget: event.currentTarget }, true);
          }
        }}
        onClick={click}
      >
        <span ref={trackRef} className="squish-switch__track">
          <motion.span className="squish-switch__thumb" aria-hidden="true" style={{ x, scaleX, scaleY }} />
        </span>
      </button>
      {label ? <label htmlFor={buttonId} className="squish-switch__label">{label}</label> : null}
    </span>
  );
}
