"use client";

import {
  createContext,
  CSSProperties,
  forwardRef,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
  useContext,
  useMemo,
} from "react";
import styles from "./grid.module.css";
import { cn } from "../lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

type GridBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";
type GuideType = "row" | "column";
type GridFlow = "row" | "column" | "dense" | "row dense" | "column dense";
type GridAlignment = "start" | "end" | "center" | "stretch";
type GridJustification =
  | "start"
  | "end"
  | "center"
  | "stretch"
  | "space-between"
  | "space-around";

type ResponsiveValue<T> = T | Partial<Record<GridBreakpoint, T>>;

interface GridStyles {
  readonly columns: ResponsiveValue<number | string>;
  readonly rows?: ResponsiveValue<number | string>;
  readonly autoFlow?: GridFlow;
  readonly gap?: string | number;
  readonly columnGap?: string | number;
  readonly rowGap?: string | number;
  readonly alignItems?: GridAlignment;
  readonly justifyItems?: GridJustification;
  readonly alignContent?: GridAlignment;
  readonly justifyContent?: GridJustification;
  readonly height?: string;
}

interface GridContextValue {
  readonly debug?: boolean;
  readonly container?: boolean;
  readonly guideWidth?: number;
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

const GridContext = createContext<GridContextValue>({});

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

const createGridTemplate = (value: number | string): string =>
  typeof value === "number" ? `repeat(${value}, 1fr)` : String(value);

const createResponsiveStyles = <T extends Record<string, unknown>>(
  prefix: string,
  value: ResponsiveValue<string | number> | undefined,
  transform: (val: string | number) => string
): Partial<T> => {
  if (!value || typeof value !== "object") return {};

  return Object.entries(value).reduce((acc, [breakpoint, val]) => {
    const key = `${prefix}-${breakpoint}` as keyof T;
    return { ...acc, [key]: transform(val) };
  }, {});
};

/* -------------------------------------------------------------------------------------------------
 * GridSystem
 * -----------------------------------------------------------------------------------------------*/

interface GridSystemProps {
  readonly children: ReactNode;
  readonly guideWidth?: number;
  readonly unstable_useContainer?: boolean;
  readonly className?: string;
}

const GridSystem = forwardRef<HTMLDivElement, GridSystemProps>(
  (props, forwardedRef) => {
    const {
      children,
      guideWidth = 1,
      unstable_useContainer = false,
      className,
    } = props;

    const contextValue = useMemo(
      () => ({ container: unstable_useContainer, guideWidth }),
      [unstable_useContainer, guideWidth]
    );

    return (
      <GridContext.Provider value={contextValue}>
        <div
          ref={forwardedRef}
          className={cn(
            styles.gridSystem,
            unstable_useContainer && styles.container,
            className
          )}
        >
          {children}
        </div>
      </GridContext.Provider>
    );
  }
);

GridSystem.displayName = "GridSystem";

/* -------------------------------------------------------------------------------------------------
 * Grid
 * -----------------------------------------------------------------------------------------------*/

interface GridProps extends GridStyles {
  readonly children?: ReactNode;
  readonly hideGuides?: GuideType;
  readonly debug?: boolean;
  readonly className?: string;
}

interface GridComponent
  extends ForwardRefExoticComponent<GridProps & RefAttributes<HTMLDivElement>> {
  Cell: typeof GridCell;
  System: typeof GridSystem;
}

const Grid = forwardRef<HTMLDivElement, GridProps>((props, forwardedRef) => {
  const {
    columns,
    rows = 1,
    autoFlow,
    gap,
    columnGap,
    rowGap,
    alignItems,
    justifyItems,
    alignContent,
    justifyContent,
    children,
    height,
    hideGuides,
    debug = false,
    className,
  } = props;

  const { container, guideWidth } = useContext(GridContext);

  const style = {
    "--grid-columns":
      typeof columns === "string"
        ? columns
        : createGridTemplate(columns as number),
    "--grid-rows":
      typeof rows === "string" ? rows : createGridTemplate(rows as number),
    "--grid-auto-flow": autoFlow,
    "--grid-gap": gap,
    "--grid-column-gap": columnGap,
    "--grid-row-gap": rowGap,
    "--grid-align-items": alignItems,
    "--grid-justify-items": justifyItems,
    "--grid-align-content": alignContent,
    "--grid-justify-content": justifyContent,
    "--guide-width": guideWidth ? `${guideWidth}px` : undefined,
    height,
    ...createResponsiveStyles("--grid-template", columns, createGridTemplate),
    ...createResponsiveStyles("--grid-template-rows", rows, createGridTemplate),
  } as CSSProperties;

  const contextValue = useMemo(() => ({ debug }), [debug]);

  return (
    <GridContext.Provider value={contextValue}>
      <div
        ref={forwardedRef}
        className={cn(
          styles.grid,
          hideGuides && styles[`hideGuides${hideGuides}`],
          debug && styles.debug,
          container && styles.container,
          className
        )}
        style={style}
      >
        {children}
        {debug && <GridDebugOverlay columns={columns} rows={rows} />}
      </div>
    </GridContext.Provider>
  );
}) as GridComponent;

Grid.displayName = "Grid";

/* -------------------------------------------------------------------------------------------------
 * GridCell
 * -----------------------------------------------------------------------------------------------*/

interface GridCellProps {
  readonly children?: ReactNode;
  readonly column?: ResponsiveValue<string | number>;
  readonly row?: ResponsiveValue<string | number>;
  readonly alignSelf?: GridAlignment;
  readonly justifySelf?: GridJustification;
  readonly solid?: boolean;
  readonly className?: string;
}

const GridCell = forwardRef<HTMLDivElement, GridCellProps>(
  (props, forwardedRef) => {
    const { children, column, row, alignSelf, justifySelf, solid, className } =
      props;

    const { debug } = useContext(GridContext);

    const style = {
      "--cell-align-self": alignSelf,
      "--cell-justify-self": justifySelf,
      ...createResponsiveStyles("--cell", column, String),
      ...createResponsiveStyles("--cell-row", row, String),
    } as CSSProperties;

    return (
      <div
        ref={forwardedRef}
        className={cn(
          styles.cell,
          solid && styles.solid,
          debug && styles.debug,
          className
        )}
        style={style}
      >
        {children}
        {debug && (
          <div className={styles.cellDebug}>
            {`${
              typeof column === "object" ? "responsive" : column ?? "auto"
            } × ${typeof row === "object" ? "responsive" : row ?? "auto"}`}
          </div>
        )}
      </div>
    );
  }
);

GridCell.displayName = "GridCell";

/* -------------------------------------------------------------------------------------------------
 * GridDebugOverlay
 * -----------------------------------------------------------------------------------------------*/

const GridDebugOverlay = ({
  columns,
  rows,
}: Pick<GridProps, "columns" | "rows">) => (
  <div className={styles.debugOverlay}>
    <div className={styles.debugInfo}>
      Grid: {typeof columns === "object" ? "responsive" : String(columns)} ×{" "}
      {typeof rows === "object" ? "responsive" : String(rows)}
    </div>
  </div>
);

/* -------------------------------------------------------------------------------------------------
 * Compound Components
 * -----------------------------------------------------------------------------------------------*/

const Root = Grid;
const Cell = GridCell;
const System = GridSystem;

Grid.Cell = Cell;
Grid.System = System;

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export {
  Grid,
  GridCell,
  GridSystem,
  //
  Root,
  Cell,
  System,
};

export type {
  GridBreakpoint,
  ResponsiveValue,
  GuideType,
  GridFlow,
  GridAlignment,
  GridJustification,
  GridProps,
  GridCellProps,
  GridSystemProps,
};
