import { useState } from "react";

type ControlPanelProps = {
  color: string;
  sizeScale: number;
  onColorChange: (color: string) => void;
  onSizeChange: (scale: number) => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function ControlPanel({
  color,
  sizeScale,
  onColorChange,
  onSizeChange,
  onReset,
  onZoomIn,
  onZoomOut,
}: ControlPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 rounded-xl bg-gray-900/85 px-3 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur hover:bg-gray-800/90"
      >
        Controls
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex min-w-[220px] flex-col gap-3 rounded-xl bg-gray-900/85 p-4 text-white shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
          Table Controls
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded px-2 py-0.5 text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          &times;
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Table Color</span>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-8 w-full cursor-pointer rounded border-0"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">
          Table Size ({sizeScale.toFixed(1)}x)
        </span>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={sizeScale}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-full"
        />
      </label>

      <div className="flex gap-2">
        <button
          onClick={onZoomIn}
          className="flex-1 rounded bg-gray-700 px-3 py-1.5 text-sm font-medium hover:bg-gray-600"
        >
          Zoom +
        </button>
        <button
          onClick={onZoomOut}
          className="flex-1 rounded bg-gray-700 px-3 py-1.5 text-sm font-medium hover:bg-gray-600"
        >
          Zoom &minus;
        </button>
      </div>

      <button
        onClick={() => {
          if (window.confirm("Reset all table positions to defaults?")) {
            onReset();
          }
        }}
        className="rounded bg-red-800 px-3 py-1.5 text-sm font-medium hover:bg-red-700"
      >
        Reset Layout
      </button>
    </div>
  );
}

export default ControlPanel;
