// React Bits <ShapeGrid />, square variant only. https://reactbits.dev
// The hexagon / circle / triangle branches are dropped: DigiLease only ever draws
// squares, because the squares ARE the DIGIPIN grid (each cell is about 3.8 m of
// India). Paste the upstream component back if another shape is ever wanted.
import { useRef, useEffect } from "react";
import "./ShapeGrid.css";

const ShapeGrid = ({
  direction = "right",
  speed = 1,
  borderColor = "#999",
  squareSize = 40,
  hoverFillColor = "#222",
  hoverTrailAmount = 0,
  className = "",
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef(null);
  const trailCells = useRef([]);
  const cellOpacities = useRef(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
      const cols = Math.ceil(canvas.width / squareSize) + 3;
      const rows = Math.ceil(canvas.height / squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const sx = col * squareSize + offsetX;
          const sy = row * squareSize + offsetY;
          const alpha = cellOpacities.current.get(col + "," + row);
          if (alpha) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(sx, sy, squareSize, squareSize);
            ctx.globalAlpha = 1;
          }
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(sx, sy, squareSize, squareSize);
        }
      }
    };

    const updateCellOpacities = () => {
      const targets = new Map();
      if (hoveredSquare.current) {
        targets.set(hoveredSquare.current.x + "," + hoveredSquare.current.y, 1);
      }
      if (hoverTrailAmount > 0) {
        for (let i = 0; i < trailCells.current.length; i++) {
          const t = trailCells.current[i];
          const key = t.x + "," + t.y;
          if (!targets.has(key)) {
            targets.set(key, (trailCells.current.length - i) / (trailCells.current.length + 1));
          }
        }
      }
      for (const [key] of targets) {
        if (!cellOpacities.current.has(key)) cellOpacities.current.set(key, 0);
      }
      for (const [key, opacity] of cellOpacities.current) {
        const target = targets.get(key) || 0;
        const next = opacity + (target - opacity) * 0.15;
        if (next < 0.005) cellOpacities.current.delete(key);
        else cellOpacities.current.set(key, next);
      }
    };

    const updateAnimation = () => {
      const step = Math.max(speed, 0.1);
      const wrap = squareSize;
      if (direction === "right") gridOffset.current.x = (gridOffset.current.x - step + wrap) % wrap;
      else if (direction === "left") gridOffset.current.x = (gridOffset.current.x + step + wrap) % wrap;
      else if (direction === "up") gridOffset.current.y = (gridOffset.current.y + step + wrap) % wrap;
      else if (direction === "down") gridOffset.current.y = (gridOffset.current.y - step + wrap) % wrap;
      else if (direction === "diagonal") {
        gridOffset.current.x = (gridOffset.current.x - step + wrap) % wrap;
        gridOffset.current.y = (gridOffset.current.y - step + wrap) % wrap;
      }
      updateCellOpacities();
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
      const col = Math.floor((event.clientX - rect.left - offsetX) / squareSize);
      const row = Math.floor((event.clientY - rect.top - offsetY) / squareSize);
      if (!hoveredSquare.current || hoveredSquare.current.x !== col || hoveredSquare.current.y !== row) {
        if (hoveredSquare.current && hoverTrailAmount > 0) {
          trailCells.current.unshift({ ...hoveredSquare.current });
          if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
        }
        hoveredSquare.current = { x: col, y: row };
      }
    };

    const handleMouseLeave = () => {
      if (hoveredSquare.current && hoverTrailAmount > 0) {
        trailCells.current.unshift({ ...hoveredSquare.current });
        if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
      }
      hoveredSquare.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // The grid only burns frames while it is on screen and the tab is in front.
    // Under prefers-reduced-motion it paints once and never animates.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isVisible = false;
    let isPageVisible = !document.hidden;

    const tryStart = () => {
      if (!isVisible || !isPageVisible || requestRef.current) return;
      if (still) { drawGrid(); return; }
      requestRef.current = requestAnimationFrame(updateAnimation);
    };
    const tryStop = () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) tryStart();
      else tryStop();
    }, { threshold: 0 });
    io.observe(canvas);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) tryStart();
      else tryStop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    tryStart();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      tryStop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, hoverTrailAmount]);

  return <canvas ref={canvasRef} className={`shapegrid-canvas ${className}`} aria-hidden="true" />;
};

export default ShapeGrid;
