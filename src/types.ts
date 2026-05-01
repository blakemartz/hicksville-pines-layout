export type TableShape = "round" | "rect";

export type TablePosition = {
  x: number; // percentage of image width (0–100)
  y: number; // percentage of image height (0–100)
};

export type TableConfig = {
  id: number;
  label: string;
  shape: TableShape;
  position: TablePosition;
};

export type LayoutState = {
  version: 1;
  tables: TableConfig[];
  color: string;
  sizeScale: number;
};
