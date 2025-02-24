'use client'

import type { CSSProperties, ReactNode } from 'react'
import { createContext, useContext, useEffect, useId, useMemo, useState } from 'react'
import { cn } from '../lib/utils'
import styles from './grid.module.css'

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  smd: 768,
  md: 1024,
  lg: 1280,
  xl: 1536,
} as const

/* -------------------------------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------------------------------- */
type Breakpoint = keyof typeof BREAKPOINTS
type GridDimension = number | string
type GridAutoFlow = 'row' | 'column' | 'row dense' | 'column dense'
type GridAlignment = 'start' | 'end' | 'center' | 'stretch' | 'baseline'
type GridJustification = 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'
type GuideType = 'row' | 'column' | 'both'
type GridPlacement = number | `${number}` | 'auto' | `span ${number}` | `${number} / ${number}` | `${number} / span ${number}`
type ContainerType = 'inline-size' | 'size' | 'normal'
type GridHeight = 'preserve-aspect-ratio' | 'auto' | string

type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>

interface ContainerQuery {
  readonly name: string
  readonly minWidth?: number
  readonly maxWidth?: number
  readonly minHeight?: number
  readonly maxHeight?: number
}

interface Guide {
  readonly x: number
  readonly y: number
  readonly breakpoint: Breakpoint
  readonly borderRight: boolean
  readonly borderBottom: boolean
}

interface GridContextValue {
  readonly debug: boolean
  readonly containerId: string
  readonly currentBreakpoint: Breakpoint
  readonly columnsMap: Partial<Record<Breakpoint, number>>
  readonly rowsMap: Partial<Record<Breakpoint, number>>
  readonly containerQueries?: readonly ContainerQuery[]
  readonly guideWidth?: number
  readonly hideGuides?: GuideType
}
/* -------------------------------------------------------------------------------------------------
 * Context
 * ----------------------------------------------------------------------------------------------- */
const GridContext = createContext<GridContextValue | null>(null)
function useGrid() {
  const context = useContext(GridContext)
  if (!context)
    throw new Error('Grid components must be wrapped in <GridSystem>')
  return context
}

/* -------------------------------------------------------------------------------------------------
 * Utils
 * ----------------------------------------------------------------------------------------------- */
function parseDimension(value: GridDimension): number {
  if (typeof value === 'number')
    return value

  const repeatRegex = (/^repeat\((\d+),\s*(?:\S.*)?\)$/)
  const repeatMatch = repeatRegex.exec(value)
  if (repeatMatch)
    return Number.parseInt(repeatMatch[1], 10)

  const frRegex = /^(\d+)fr$/
  const frMatch = frRegex.exec(value)
  if (frMatch)
    return Number.parseInt(frMatch[1], 10)

  return 0
}

function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs')

  useEffect(() => {
    const handler = () => {
      const width = window.innerWidth
      const entries = Object.entries(BREAKPOINTS) as [Breakpoint, number][]
      const newBreakpoint = entries
        .slice() // Create a copy before reversing
        .reverse()
        .find(([, value]) => width >= value)?.[0] ?? 'xs'
      setBreakpoint(newBreakpoint)
    }

    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return breakpoint
}

/* -------------------------------------------------------------------------------------------------
 * GridGuides
 * ----------------------------------------------------------------------------------------------- */
interface GridGuidesProps {
  readonly columns: ResponsiveProp<GridDimension>
  readonly rows: ResponsiveProp<GridDimension>
  readonly hideGuides?: GuideType
}

function GridGuides({ columns, rows: initialRows, hideGuides }: GridGuidesProps) {
  const { currentBreakpoint, guideWidth = 1 } = useGrid()
  const [guides, setGuides] = useState<Guide[]>([])

  useEffect(() => {
    const calculateGuides = () => {
      const result: Guide[] = []
      const breakpoints = Object.keys(BREAKPOINTS) as Breakpoint[]

      breakpoints.forEach((breakpoint) => {
        const cols = parseDimension(
          typeof columns === 'object' ? columns[breakpoint] ?? 0 : columns,
        )
        const rowsCount = parseDimension(
          typeof initialRows === 'object' ? initialRows[breakpoint] ?? 0 : initialRows,
        )

        if (cols > 0) {
          for (let i = 0; i <= cols; i++) {
            result.push({
              x: (i / cols) * 100,
              y: 0,
              breakpoint,
              borderRight: i < cols,
              borderBottom: false,
            })
          }
        }

        if (rowsCount > 0) {
          for (let i = 0; i <= rowsCount; i++) {
            result.push({
              x: 0,
              y: (i / rowsCount) * 100,
              breakpoint,
              borderRight: false,
              borderBottom: i < rowsCount,
            })
          }
        }
      })

      setGuides(result)
    }

    calculateGuides()
  }, [columns, initialRows])

  return (
    <div className={styles.guidesContainer}>
      {guides.map((guide, _idx) => (
        <div
          key={`guide-${guide.breakpoint}-${guide.x}-${guide.y}-${guide.borderRight}-${guide.borderBottom}`}
          className={cn(
            styles.guide,
            guide.breakpoint === currentBreakpoint && styles.active,
            hideGuides === 'column' && guide.borderRight && styles.hidden,
            hideGuides === 'row' && guide.borderBottom && styles.hidden,
            hideGuides === 'both' && (guide.borderRight || guide.borderBottom) && styles.hidden,
          )}
          style={{
            '--x': `${guide.x}%`,
            '--y': `${guide.y}%`,
            '--guide-width': `${guideWidth}px`,
          } as CSSProperties}
          data-breakpoint={guide.breakpoint}
        />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * GridSystem
 * ----------------------------------------------------------------------------------------------- */
interface GridSystemProps {
  readonly children?: ReactNode
  readonly debug?: boolean
  readonly showGuides?: boolean
  readonly className?: string
  readonly style?: CSSProperties
  readonly containerType?: ContainerType
  readonly containerQueries?: readonly ContainerQuery[]
  readonly guideWidth?: number
  readonly height?: GridHeight
  width?: string
}

function GridSystem({
  children,
  debug = false,
  className,
  style,
  containerType,
  containerQueries,
  guideWidth = 1,
  height = 'auto',
  width = '100%',
}: Readonly<GridSystemProps>) {
  const containerId = useId().replace(/:/g, '')
  const currentBreakpoint = useBreakpoint()

  const contextValue = useMemo(() => ({
    debug,
    containerId,
    currentBreakpoint,
    columnsMap: {},
    rowsMap: {},
    containerQueries,
    guideWidth,
  }), [debug, containerId, currentBreakpoint, containerQueries, guideWidth])

  const systemStyles: CSSProperties = {
    ...style,
    containerType,
    height: height === 'preserve-aspect-ratio' ? 'fit-content' : height,
    width,
    ['--container-name' as any]: `grid-${containerId}`,
  }

  return (
    <GridContext value={contextValue}>
      <div
        className={cn(styles.system, className)}
        style={systemStyles}
        data-breakpoint={currentBreakpoint}
      >
        {children}
      </div>
    </GridContext>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Grid
 * ----------------------------------------------------------------------------------------------- */
interface GridProps {
  readonly children?: ReactNode
  readonly columns: ResponsiveProp<GridDimension>
  readonly rows?: ResponsiveProp<GridDimension>
  readonly gap?: ResponsiveProp<string | number>
  readonly rowGap?: ResponsiveProp<string | number>
  readonly columnGap?: ResponsiveProp<string | number>
  readonly autoFlow?: GridAutoFlow
  readonly autoRows?: ResponsiveProp<string>
  readonly autoColumns?: ResponsiveProp<string>
  readonly justifyItems?: GridJustification
  readonly alignItems?: GridAlignment
  readonly justifyContent?: GridJustification
  readonly alignContent?: GridAlignment
  readonly templateAreas?: string
  readonly className?: string
  readonly style?: CSSProperties
  readonly hideGuides?: GuideType
  readonly height?: GridHeight
}

function Grid({
  children,
  columns,
  rows = 'auto',
  gap,
  rowGap,
  columnGap,
  autoFlow,
  autoRows,
  autoColumns,
  justifyItems,
  alignItems,
  justifyContent,
  alignContent,
  templateAreas,
  className,
  style,
  hideGuides,
  showGuides = false,
  height = 'auto',
}: GridProps & { showGuides?: boolean }) {
  const { debug, containerId } = useGrid()

  const generateResponsiveCSS = <T,>(
    prop: ResponsiveProp<T> | undefined,
    prefix: string,
    transform: (value: T) => string = String,
  ) => {
    if (!prop)
      return {}
    const result: Record<string, string> = {}

    if (typeof prop === 'object') {
      Object.entries(prop).forEach(([bp, value]) => {
        if (bp in BREAKPOINTS) {
          result[`--${bp}-${prefix}`] = transform(value)
        }
      })
    }
    else {
      result[`--${prefix}`] = transform(prop)
    }
    return result
  }

  const gridStyles = useMemo(() => {
    const baseStyles: CSSProperties = {
      gridAutoFlow: autoFlow,
      gridTemplateAreas: templateAreas,
      justifyItems,
      alignItems,
      justifyContent,
      alignContent,
      height: height === 'preserve-aspect-ratio' ? 'var(--height)' : height,
    }

    const responsiveStyles = {
      ...generateResponsiveCSS(columns, 'grid-columns', val =>
        typeof val === 'number' ? `repeat(${val}, 1fr)` : val),
      ...generateResponsiveCSS(rows, 'grid-rows', val =>
        typeof val === 'number' ? `repeat(${val}, 1fr)` : val),
      ...generateResponsiveCSS(gap, 'gap', val =>
        typeof val === 'number' ? `${val}px` : val),
      ...generateResponsiveCSS(rowGap, 'row-gap', val =>
        typeof val === 'number' ? `${val}px` : val),
      ...generateResponsiveCSS(columnGap, 'column-gap', val =>
        typeof val === 'number' ? `${val}px` : val),
      ...generateResponsiveCSS(autoRows, 'auto-rows'),
      ...generateResponsiveCSS(autoColumns, 'auto-columns'),
    }

    return {
      ...baseStyles,
      ...responsiveStyles,
      ...style,
    }
  }, [columns, rows, gap, rowGap, columnGap, autoFlow, autoRows, autoColumns, justifyItems, alignItems, justifyContent, alignContent, templateAreas, style, height])

  return (
    <div
      className={cn(
        styles.grid,
        debug && styles.debug,
        hideGuides && styles[`hide-${hideGuides}`],
        className,
      )}
      style={gridStyles}
      data-container={containerId}
    >
      {showGuides && (
        <GridGuides
          columns={columns}
          rows={rows}
          hideGuides={hideGuides}
        />
      )}
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * GridCell
 * ----------------------------------------------------------------------------------------------- */
interface GridCellProps {
  readonly children?: ReactNode
  readonly column?: ResponsiveProp<GridPlacement>
  readonly row?: ResponsiveProp<GridPlacement>
  readonly area?: string
  readonly justifySelf?: GridJustification
  readonly alignSelf?: GridAlignment
  readonly columnStart?: ResponsiveProp<GridPlacement>
  readonly columnEnd?: ResponsiveProp<GridPlacement>
  readonly rowStart?: ResponsiveProp<GridPlacement>
  readonly rowEnd?: ResponsiveProp<GridPlacement>
  readonly order?: ResponsiveProp<number>
  readonly className?: string
  readonly style?: CSSProperties
  readonly solid?: boolean
}

function GridCell({
  children,
  column,
  row,
  area,
  justifySelf,
  alignSelf,
  columnStart,
  columnEnd,
  rowStart,
  rowEnd,
  order,
  className,
  style,
  solid = false,
}: GridCellProps) {
  const generatePlacementCSS = (
    prop: ResponsiveProp<GridPlacement | number> | undefined,
    prefix: string,
  ) => {
    if (!prop)
      return {}
    const result: Record<string, string> = {}

    if (typeof prop === 'object') {
      Object.entries(prop).forEach(([bp, value]) => {
        if (bp in BREAKPOINTS) {
          result[`--${bp}-${prefix}`] = String(value)
        }
      })
    }
    else {
      result[`--${prefix}`] = String(prop)
    }
    return result
  }

  const cellStyles = useMemo(() => {
    const placementStyles = {
      ...generatePlacementCSS(column, 'grid-column'),
      ...generatePlacementCSS(row, 'grid-row'),
      ...generatePlacementCSS(columnStart, 'grid-column-start'),
      ...generatePlacementCSS(columnEnd, 'grid-column-end'),
      ...generatePlacementCSS(rowStart, 'grid-row-start'),
      ...generatePlacementCSS(rowEnd, 'grid-row-end'),
      ...generatePlacementCSS(order, 'order'),
    }

    return {
      gridArea: area,
      justifySelf,
      alignSelf,
      ...placementStyles,
      ...style,
    }
  }, [column, row, area, justifySelf, alignSelf, columnStart, columnEnd, rowStart, rowEnd, order, style])

  return (
    <div
      className={cn(
        styles.cell,
        solid && styles.solid,
        className,
      )}
      style={cellStyles}
    >
      {children}
    </div>
  )
}

export { Grid, GridCell, GridSystem }
export type {
  ContainerQuery,
  ContainerType,
  GridAlignment,
  GridAutoFlow,
  GridCellProps,
  GridJustification,
  GridPlacement,
  GridProps,
  GridSystemProps,
}
