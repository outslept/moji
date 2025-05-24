'use client'

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/utils'

/* -------------------------------------------------------------------------------------------------
 * Constants & Types
 * ----------------------------------------------------------------------------------------------- */

export const BREAKPOINTS = {
  'base': 0,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS
export type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>

// Grid template types
export type GridColumns = number | 'auto-fit' | 'auto-fill' | string | (string | number)[]
export type GridRows = number | 'auto' | string | (string | number)[]
export type GridGap = number | string
export type GridAlignment = 'start' | 'end' | 'center' | 'stretch' | 'baseline'
export type GridJustification = 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'
export type GridAutoFlow = 'row' | 'column' | 'dense' | 'row dense' | 'column dense'
export type GridPlacement = number | 'auto' | `span ${number}` | `${number} / ${number}` | `${number} / span ${number}`

// Spacing presets
export type SpacingPreset = 'none' | 'tight' | 'standard' | 'relaxed' | 'wide'

/* -------------------------------------------------------------------------------------------------
 * Context
 * ----------------------------------------------------------------------------------------------- */

interface GridContextValue {
  debug: boolean
  currentBreakpoint: Breakpoint
  spacing: SpacingPreset
}

const GridContext = createContext<GridContextValue | null>(null)

function useGrid() {
  const context = useContext(GridContext)
  if (!context) {
    throw new Error('Grid components must be used within Grid.Root')
  }
  return context
}

/* -------------------------------------------------------------------------------------------------
 * Hooks
 * ----------------------------------------------------------------------------------------------- */

function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('base')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      const entries = Object.entries(BREAKPOINTS) as [Breakpoint, number][]
      const current = entries
        .filter(([, value]) => width >= value)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'base'
      setBreakpoint(current)
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * ----------------------------------------------------------------------------------------------- */

function resolveResponsiveValue<T>(
  value: ResponsiveProp<T> | undefined,
  currentBreakpoint: Breakpoint,
): T | undefined {
  if (value === undefined)
    return undefined

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const breakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'base']
    const currentIndex = breakpoints.indexOf(currentBreakpoint)

    // Find the closest defined value at or below current breakpoint
    for (let i = currentIndex; i < breakpoints.length; i++) {
      const bp = breakpoints[i]
      if (value[bp] !== undefined) {
        return value[bp]
      }
    }
    return undefined
  }

  return value as T
}

function transformColumns(value: GridColumns): string {
  if (typeof value === 'number') {
    return `repeat(${value}, 1fr)`
  }
  if (value === 'auto-fit') {
    return 'repeat(auto-fit, minmax(250px, 1fr))'
  }
  if (value === 'auto-fill') {
    return 'repeat(auto-fill, minmax(250px, 1fr))'
  }
  if (Array.isArray(value)) {
    return value.map(v => typeof v === 'number' ? `${v}fr` : v).join(' ')
  }
  return value
}

function transformRows(value: GridRows): string {
  if (typeof value === 'number') {
    return `repeat(${value}, 1fr)`
  }
  if (value === 'auto') {
    return 'auto'
  }
  if (Array.isArray(value)) {
    return value.map(v => typeof v === 'number' ? `${v}fr` : v).join(' ')
  }
  return value
}

function transformGap(value: GridGap): string {
  return typeof value === 'number' ? `${value}px` : value
}

function getSpacingValue(preset: SpacingPreset): string {
  const spacingMap: Record<SpacingPreset, string> = {
    none: '0',
    tight: '8px',
    standard: '16px',
    relaxed: '24px',
    wide: '32px',
  }
  return spacingMap[preset]
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Root
 * ----------------------------------------------------------------------------------------------- */

export interface GridRootProps extends ComponentPropsWithoutRef<'div'> {
  debug?: boolean
  spacing?: SpacingPreset
  children?: ReactNode
}

function GridRoot({
  debug = false,
  spacing = 'standard',
  children,
  className,
  ...props
}: GridRootProps) {
  const currentBreakpoint = useBreakpoint()

  const contextValue = useMemo(() => ({
    debug,
    currentBreakpoint,
    spacing,
  }), [debug, currentBreakpoint, spacing])

  return (
    <GridContext value={contextValue}>
      <div
        className={cn('grid-root', className)}
        data-grid-root=""
        data-breakpoint={currentBreakpoint}
        data-debug={debug ? '' : undefined}
        {...props}
      >
        {children}
      </div>
    </GridContext>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Container
 * ----------------------------------------------------------------------------------------------- */

export interface GridContainerProps extends ComponentPropsWithoutRef<'div'> {
  columns?: ResponsiveProp<GridColumns>
  rows?: ResponsiveProp<GridRows>
  areas?: ResponsiveProp<string>
  gap?: ResponsiveProp<GridGap> | SpacingPreset
  columnGap?: ResponsiveProp<GridGap>
  rowGap?: ResponsiveProp<GridGap>
  autoFlow?: ResponsiveProp<GridAutoFlow>
  autoRows?: ResponsiveProp<string>
  autoColumns?: ResponsiveProp<string>
  justifyItems?: ResponsiveProp<GridJustification>
  alignItems?: ResponsiveProp<GridAlignment>
  justifyContent?: ResponsiveProp<GridJustification>
  alignContent?: ResponsiveProp<GridAlignment>
  minItemWidth?: string
  maxItemWidth?: string
  aspectRatio?: string
  children?: ReactNode
}

function GridContainer({
  columns,
  rows,
  areas,
  gap,
  columnGap,
  rowGap,
  autoFlow,
  autoRows,
  autoColumns,
  justifyItems,
  alignItems,
  justifyContent,
  alignContent,
  minItemWidth = '250px',
  maxItemWidth = '1fr',
  aspectRatio,
  className,
  style,
  children,
  ...props
}: GridContainerProps) {
  const { debug, currentBreakpoint, spacing } = useGrid()

  const gridStyles = useMemo((): CSSProperties => {
    const resolvedColumns = resolveResponsiveValue(columns, currentBreakpoint)
    const resolvedRows = resolveResponsiveValue(rows, currentBreakpoint)
    const resolvedAreas = resolveResponsiveValue(areas, currentBreakpoint)

    // Handle gap - can be responsive prop or spacing preset
    let resolvedGap: string | undefined
    if (typeof gap === 'string' && ['none', 'tight', 'standard', 'relaxed', 'wide'].includes(gap)) {
      resolvedGap = getSpacingValue(gap as SpacingPreset)
    }
    else {
      const gapValue = resolveResponsiveValue(gap as ResponsiveProp<GridGap>, currentBreakpoint)
      resolvedGap = gapValue ? transformGap(gapValue) : getSpacingValue(spacing)
    }

    const styles: CSSProperties = {
      display: 'grid',
      gap: resolvedGap,
    }

    if (resolvedColumns) {
      styles.gridTemplateColumns = transformColumns(resolvedColumns)
    }

    if (resolvedRows) {
      styles.gridTemplateRows = transformRows(resolvedRows)
    }

    if (resolvedAreas) {
      styles.gridTemplateAreas = resolvedAreas
    }

    // Handle auto-fit/auto-fill with custom sizing
    if (resolvedColumns === 'auto-fit' || resolvedColumns === 'auto-fill') {
      styles.gridTemplateColumns = `repeat(${resolvedColumns}, minmax(${minItemWidth}, ${maxItemWidth}))`
    }

    // Apply other responsive properties
    const resolvedColumnGap = resolveResponsiveValue(columnGap, currentBreakpoint)
    if (resolvedColumnGap) {
      styles.columnGap = transformGap(resolvedColumnGap)
    }

    const resolvedRowGap = resolveResponsiveValue(rowGap, currentBreakpoint)
    if (resolvedRowGap) {
      styles.rowGap = transformGap(resolvedRowGap)
    }

    const resolvedAutoFlow = resolveResponsiveValue(autoFlow, currentBreakpoint)
    if (resolvedAutoFlow) {
      styles.gridAutoFlow = resolvedAutoFlow
    }

    const resolvedAutoRows = resolveResponsiveValue(autoRows, currentBreakpoint)
    if (resolvedAutoRows) {
      styles.gridAutoRows = resolvedAutoRows
    }

    const resolvedAutoColumns = resolveResponsiveValue(autoColumns, currentBreakpoint)
    if (resolvedAutoColumns) {
      styles.gridAutoColumns = resolvedAutoColumns
    }

    const resolvedJustifyItems = resolveResponsiveValue(justifyItems, currentBreakpoint)
    if (resolvedJustifyItems) {
      styles.justifyItems = resolvedJustifyItems
    }

    const resolvedAlignItems = resolveResponsiveValue(alignItems, currentBreakpoint)
    if (resolvedAlignItems) {
      styles.alignItems = resolvedAlignItems
    }

    const resolvedJustifyContent = resolveResponsiveValue(justifyContent, currentBreakpoint)
    if (resolvedJustifyContent) {
      styles.justifyContent = resolvedJustifyContent
    }

    const resolvedAlignContent = resolveResponsiveValue(alignContent, currentBreakpoint)
    if (resolvedAlignContent) {
      styles.alignContent = resolvedAlignContent
    }

    if (aspectRatio) {
      styles.aspectRatio = aspectRatio
    }

    return { ...styles, ...style }
  }, [
    columns,
    rows,
    areas,
    gap,
    columnGap,
    rowGap,
    autoFlow,
    autoRows,
    autoColumns,
    justifyItems,
    alignItems,
    justifyContent,
    alignContent,
    minItemWidth,
    maxItemWidth,
    aspectRatio,
    currentBreakpoint,
    spacing,
    style,
  ])

  return (
    <div
      className={cn('grid-container', debug && 'grid-debug', className)}
      style={gridStyles}
      data-grid-container=""
      {...props}
    >
      {debug && <GridDebugOverlay />}
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Item
 * ----------------------------------------------------------------------------------------------- */

export interface GridItemProps extends ComponentPropsWithoutRef<'div'> {
  column?: ResponsiveProp<GridPlacement>
  row?: ResponsiveProp<GridPlacement>
  columnStart?: ResponsiveProp<GridPlacement>
  columnEnd?: ResponsiveProp<GridPlacement>
  rowStart?: ResponsiveProp<GridPlacement>
  rowEnd?: ResponsiveProp<GridPlacement>
  area?: ResponsiveProp<string>
  order?: ResponsiveProp<number>
  justifySelf?: ResponsiveProp<GridJustification>
  alignSelf?: ResponsiveProp<GridAlignment>
  span?: ResponsiveProp<number>
  rowSpan?: ResponsiveProp<number>
  aspectRatio?: string
  interactive?: boolean
  children?: ReactNode
}

function GridItem({
  column,
  row,
  columnStart,
  columnEnd,
  rowStart,
  rowEnd,
  area,
  order,
  justifySelf,
  alignSelf,
  span,
  rowSpan,
  aspectRatio,
  interactive = false,
  className,
  style,
  children,
  ...props
}: GridItemProps) {
  const { debug, currentBreakpoint } = useGrid()

  const itemStyles = useMemo((): CSSProperties => {
    const styles: CSSProperties = {}

    // Handle span shorthand
    const resolvedSpan = resolveResponsiveValue(span, currentBreakpoint)
    if (resolvedSpan) {
      styles.gridColumn = `span ${resolvedSpan}`
    }

    const resolvedRowSpan = resolveResponsiveValue(rowSpan, currentBreakpoint)
    if (resolvedRowSpan) {
      styles.gridRow = `span ${resolvedRowSpan}`
    }

    // Handle explicit positioning (overrides span)
    const resolvedColumn = resolveResponsiveValue(column, currentBreakpoint)
    if (resolvedColumn) {
      styles.gridColumn = String(resolvedColumn)
    }

    const resolvedRow = resolveResponsiveValue(row, currentBreakpoint)
    if (resolvedRow) {
      styles.gridRow = String(resolvedRow)
    }

    const resolvedColumnStart = resolveResponsiveValue(columnStart, currentBreakpoint)
    if (resolvedColumnStart) {
      styles.gridColumnStart = String(resolvedColumnStart)
    }

    const resolvedColumnEnd = resolveResponsiveValue(columnEnd, currentBreakpoint)
    if (resolvedColumnEnd) {
      styles.gridColumnEnd = String(resolvedColumnEnd)
    }

    const resolvedRowStart = resolveResponsiveValue(rowStart, currentBreakpoint)
    if (resolvedRowStart) {
      styles.gridRowStart = String(resolvedRowStart)
    }

    const resolvedRowEnd = resolveResponsiveValue(rowEnd, currentBreakpoint)
    if (resolvedRowEnd) {
      styles.gridRowEnd = String(resolvedRowEnd)
    }

    const resolvedArea = resolveResponsiveValue(area, currentBreakpoint)
    if (resolvedArea) {
      styles.gridArea = resolvedArea
    }

    const resolvedOrder = resolveResponsiveValue(order, currentBreakpoint)
    if (resolvedOrder) {
      styles.order = resolvedOrder
    }

    const resolvedJustifySelf = resolveResponsiveValue(justifySelf, currentBreakpoint)
    if (resolvedJustifySelf) {
      styles.justifySelf = resolvedJustifySelf
    }

    const resolvedAlignSelf = resolveResponsiveValue(alignSelf, currentBreakpoint)
    if (resolvedAlignSelf) {
      styles.alignSelf = resolvedAlignSelf
    }

    if (aspectRatio) {
      styles.aspectRatio = aspectRatio
    }

    return { ...styles, ...style }
  }, [
    column,
    row,
    columnStart,
    columnEnd,
    rowStart,
    rowEnd,
    area,
    order,
    justifySelf,
    alignSelf,
    span,
    rowSpan,
    aspectRatio,
    currentBreakpoint,
    style,
  ])

  return (
    <div
      className={cn(
        'grid-item',
        interactive && 'grid-item-interactive',
        debug && 'grid-debug',
        className,
      )}
      style={itemStyles}
      data-grid-item=""
      data-interactive={interactive ? '' : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Area
 * ----------------------------------------------------------------------------------------------- */

export interface GridAreaProps extends ComponentPropsWithoutRef<'div'> {
  name: string
  children?: ReactNode
}

function GridArea({ name, className, style, children, ...props }: GridAreaProps) {
  const areaStyles = useMemo((): CSSProperties => ({
    gridArea: name,
    ...style,
  }), [name, style])

  return (
    <div
      className={cn('grid-area', className)}
      style={areaStyles}
      data-grid-area={name}
      {...props}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Stack
 * ----------------------------------------------------------------------------------------------- */

export interface GridStackProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode
}

function GridStack({ className, style, children, ...props }: GridStackProps) {
  const stackStyles = useMemo((): CSSProperties => ({
    position: 'relative',
    ...style,
  }), [style])

  return (
    <div
      className={cn('grid-stack', className)}
      style={stackStyles}
      data-grid-stack=""
      {...props}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className="grid-stack-item"
              style={{
                position: 'absolute',
                inset: 0,
              }}
              data-grid-stack-item=""
            >
              {child}
            </div>
          ))
        : children && (
          <div
            className="grid-stack-item"
            style={{
              position: 'absolute',
              inset: 0,
            }}
            data-grid-stack-item=""
          >
            {children}
          </div>
        )}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Grid.AutoGrid
 * ----------------------------------------------------------------------------------------------- */

export interface GridAutoGridProps extends ComponentPropsWithoutRef<'div'> {
  minItemWidth?: ResponsiveProp<string>
  maxItemWidth?: ResponsiveProp<string>
  gap?: ResponsiveProp<GridGap> | SpacingPreset
  aspectRatio?: string
  children?: ReactNode
}

function GridAutoGrid({
  minItemWidth = '250px',
  maxItemWidth = '1fr',
  gap,
  aspectRatio,
  className,
  style,
  children,
  ...props
}: GridAutoGridProps) {
  const { currentBreakpoint, spacing } = useGrid()

  const autoGridStyles = useMemo((): CSSProperties => {
    const resolvedMinWidth = resolveResponsiveValue(minItemWidth, currentBreakpoint) || '250px'
    const resolvedMaxWidth = resolveResponsiveValue(maxItemWidth, currentBreakpoint) || '1fr'

    let resolvedGap: string
    if (typeof gap === 'string' && ['none', 'tight', 'standard', 'relaxed', 'wide'].includes(gap)) {
      resolvedGap = getSpacingValue(gap as SpacingPreset)
    }
    else {
      const gapValue = resolveResponsiveValue(gap as ResponsiveProp<GridGap>, currentBreakpoint)
      resolvedGap = gapValue ? transformGap(gapValue) : getSpacingValue(spacing)
    }

    const styles: CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${resolvedMinWidth}, ${resolvedMaxWidth}))`,
      gap: resolvedGap,
    }

    if (aspectRatio) {
      styles.aspectRatio = aspectRatio
    }

    return { ...styles, ...style }
  }, [minItemWidth, maxItemWidth, gap, aspectRatio, currentBreakpoint, spacing, style])

  return (
    <div
      className={cn('grid-auto-grid', className)}
      style={autoGridStyles}
      data-grid-auto=""
      {...props}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Masonry (CSS Grid approximation)
 * ----------------------------------------------------------------------------------------------- */

export interface GridMasonryProps extends ComponentPropsWithoutRef<'div'> {
  columns?: ResponsiveProp<number>
  gap?: ResponsiveProp<GridGap> | SpacingPreset
  children?: ReactNode
}

function GridMasonry({
  columns = { base: 1, sm: 2, md: 3, lg: 4 },
  gap,
  className,
  style,
  children,
  ...props
}: GridMasonryProps) {
  const { currentBreakpoint, spacing } = useGrid()

  const masonryStyles = useMemo((): CSSProperties => {
    const resolvedColumns = resolveResponsiveValue(columns, currentBreakpoint) || 1

    let resolvedGap: string
    if (typeof gap === 'string' && ['none', 'tight', 'standard', 'relaxed', 'wide'].includes(gap)) {
      resolvedGap = getSpacingValue(gap as SpacingPreset)
    }
    else {
      const gapValue = resolveResponsiveValue(gap as ResponsiveProp<GridGap>, currentBreakpoint)
      resolvedGap = gapValue ? transformGap(gapValue) : getSpacingValue(spacing)
    }

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${resolvedColumns}, 1fr)`,
      gridAutoRows: 'max-content',
      gap: resolvedGap,
      ...style,
    }
  }, [columns, gap, currentBreakpoint, spacing, style])

  return (
    <div
      className={cn('grid-masonry', className)}
      style={masonryStyles}
      data-grid-masonry=""
      {...props}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Debug
 * ----------------------------------------------------------------------------------------------- */

function GridDebugOverlay() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gridInfo, setGridInfo] = useState<{ columns: number, rows: number }>({ columns: 0, rows: 0 })

  useEffect(() => {
    const container = containerRef.current?.parentElement
    if (!container)
      return

    const updateGridInfo = () => {
      const computedStyle = window.getComputedStyle(container)
      const columns = computedStyle.gridTemplateColumns.split(' ').length
      const rows = computedStyle.gridTemplateRows.split(' ').length || 1
      setGridInfo({ columns, rows })
    }

    updateGridInfo()

    const resizeObserver = new ResizeObserver(updateGridInfo)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="grid-debug-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      data-grid-debug-overlay=""
    >
      {/* Column lines */}
      {Array.from({ length: gridInfo.columns + 1 }, (_, i) => (
        <div
          key={`col-${i}`}
          className="grid-debug-line grid-debug-line-column"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${(i / gridInfo.columns) * 100}%`,
            width: '1px',
            backgroundColor: 'rgba(0, 122, 255, 0.3)',
          }}
          data-grid-debug-line="column"
        />
      ))}

      {/* Row lines */}
      {Array.from({ length: gridInfo.rows + 1 }, (_, i) => (
        <div
          key={`row-${i}`}
          className="grid-debug-line grid-debug-line-row"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${(i / gridInfo.rows) * 100}%`,
            height: '1px',
            backgroundColor: 'rgba(0, 122, 255, 0.3)',
          }}
          data-grid-debug-line="row"
        />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Preset Components
 * ----------------------------------------------------------------------------------------------- */

// Common layout presets
export interface GridLayoutProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode
}

function GridHoly({ children, ...props }: GridLayoutProps) {
  return (
    <GridContainer
      areas={{
        base: `"header" "main" "footer"`,
        md: `"header header" "sidebar main" "footer footer"`,
      }}
      rows={{ base: 'auto 1fr auto', md: 'auto 1fr auto' }}
      columns={{ base: '1fr', md: '250px 1fr' }}
      {...props}
    >
      {children}
    </GridContainer>
  )
}

function GridDashboard({ children, ...props }: GridLayoutProps) {
  return (
    <GridContainer
      areas={{
        base: `"nav" "main"`,
        lg: `"nav main"`,
      }}
      rows={{ base: 'auto 1fr', lg: '1fr' }}
      columns={{ base: '1fr', lg: '250px 1fr' }}
      {...props}
    >
      {children}
    </GridContainer>
  )
}

function GridCards({ children, ...props }: GridLayoutProps) {
  return (
    <GridAutoGrid
      minItemWidth={{ base: '280px', md: '320px' }}
      gap="standard"
      {...props}
    >
      {children}
    </GridAutoGrid>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Display Names
 * ----------------------------------------------------------------------------------------------- */

GridRoot.displayName = 'Grid.Root'
GridContainer.displayName = 'Grid.Container'
GridItem.displayName = 'Grid.Item'
GridArea.displayName = 'Grid.Area'
GridStack.displayName = 'Grid.Stack'
GridAutoGrid.displayName = 'Grid.AutoGrid'
GridMasonry.displayName = 'Grid.Masonry'
GridHoly.displayName = 'Grid.Holy'
GridDashboard.displayName = 'Grid.Dashboard'
GridCards.displayName = 'Grid.Cards'

/* -------------------------------------------------------------------------------------------------
 * Exports
 * ----------------------------------------------------------------------------------------------- */

export const Grid = {
  Root: GridRoot,
  Container: GridContainer,
  Item: GridItem,
  Area: GridArea,
  Stack: GridStack,
  AutoGrid: GridAutoGrid,
  Masonry: GridMasonry,

  // Layout presets
  Holy: GridHoly,
  Dashboard: GridDashboard,
  Cards: GridCards,
}

export { resolveResponsiveValue, useBreakpoint, useGrid }
