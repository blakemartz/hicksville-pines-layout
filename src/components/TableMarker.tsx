import { useRef } from "react";
import type { TableConfig, TablePosition } from "../types";

// Scale derived from image: 149px = 20ft at natural resolution (2618px wide)
const PX_PER_FOOT = 7.45;
const IMAGE_NATURAL_WIDTH = 2618;

type TableMarkerProps = {
  table: TableConfig;
  color: string;
  sizeScale: number;
  scale: number;
  imageWidth: number;
  imageHeight: number;
  onMove: (id: number, position: TablePosition) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

function TableMarker({
  table,
  color,
  sizeScale,
  scale,
  imageWidth,
  imageHeight,
  onMove,
  onDragStart,
  onDragEnd,
}: TableMarkerProps) {
  const dragging = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    startPointer.current = { x: e.clientX, y: e.clientY };
    startPosition.current = { x: table.position.x, y: table.position.y };
    onDragStart();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    e.stopPropagation();
    e.preventDefault();

    const deltaX = e.clientX - startPointer.current.x;
    const deltaY = e.clientY - startPointer.current.y;

    const pctX = (deltaX / (imageWidth * scale)) * 100;
    const pctY = (deltaY / (imageHeight * scale)) * 100;

    const newX = Math.max(0, Math.min(100, startPosition.current.x + pctX));
    const newY = Math.max(0, Math.min(100, startPosition.current.y + pctY));

    onMove(table.id, { x: newX, y: newY });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    onDragEnd();
  }

  const isRound = table.shape === "round";
  // Scale marker sizes to match rendered image dimensions vs natural
  const renderScale = imageWidth / IMAGE_NATURAL_WIDTH;
  const width = (isRound ? 6 : 2) * PX_PER_FOOT * sizeScale * renderScale;
  const height = (isRound ? 6 : 4) * PX_PER_FOOT * sizeScale * renderScale;
  const fontSize = Math.max(8, Math.min(width, height) * 0.35);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "absolute",
        left: `${table.position.x}%`,
        top: `${table.position.y}%`,
        width: `${width}px`,
        height: `${height}px`,
        transform: "translate(-50%, -50%)",
        backgroundColor: color,
        borderRadius: isRound ? "50%" : "4px",
        border: "2px solid rgba(255, 255, 255, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
      }}
    >
      <span
        style={{
          color: "white",
          fontWeight: 700,
          fontSize: `${fontSize}px`,
          textShadow: "0 1px 3px rgba(0, 0, 0, 0.6)",
          lineHeight: 1,
          pointerEvents: "none",
        }}
      >
        {table.label}
      </span>
    </div>
  );
}

export default TableMarker;
