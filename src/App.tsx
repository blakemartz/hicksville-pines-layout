import { useState, useCallback, useRef } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import TableMarker from "./components/TableMarker";
import ControlPanel from "./components/ControlPanel";
import { useLayoutState } from "./hooks/useLayoutState";

type ZoomControls = {
  zoomIn: () => void;
  zoomOut: () => void;
};

type ZoomBridgeProps = {
  controlsRef: React.MutableRefObject<ZoomControls | null>;
};

function ZoomBridge({ controlsRef }: ZoomBridgeProps) {
  const { zoomIn, zoomOut } = useControls();
  controlsRef.current = { zoomIn, zoomOut };
  return null;
}

function App() {
  const { state, moveTable, setColor, setSizeScale, resetLayout, shareLayout } =
    useLayoutState();
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const zoomRef = useRef<ZoomControls | null>(null);

  const handleDragStart = useCallback(() => setIsDragging(true), []);
  const handleDragEnd = useCallback(() => setIsDragging(false), []);
  const handleZoomIn = useCallback(() => zoomRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => zoomRef.current?.zoomOut(), []);

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setImageSize({ width: img.clientWidth, height: img.clientHeight });
    },
    [],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={8}
        centerZoomedOut={false}
        limitToBounds={false}
        panning={{ disabled: isDragging }}
        onTransformed={(_ref, transformState) =>
          setScale(transformState.scale)
        }
      >
        <ZoomBridge controlsRef={zoomRef} />
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%", touchAction: "none" }}
        >
          <div className="relative">
            <img
              src={`${import.meta.env.BASE_URL}hicksville-layout.png`}
              alt="Hicksville Pines aerial layout"
              className="block w-screen select-none"
              draggable={false}
              onLoad={handleImageLoad}
            />
            {imageSize.width > 0 &&
              state.tables.map((table) => (
                <TableMarker
                  key={table.id}
                  table={table}
                  color={state.color}
                  sizeScale={state.sizeScale}
                  scale={scale}
                  imageWidth={imageSize.width}
                  imageHeight={imageSize.height}
                  onMove={moveTable}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
          </div>
        </TransformComponent>
      </TransformWrapper>

      <ControlPanel
        color={state.color}
        sizeScale={state.sizeScale}
        onColorChange={setColor}
        onSizeChange={setSizeScale}
        onReset={resetLayout}
        onShare={shareLayout}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}

export default App;
