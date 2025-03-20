'use client'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { cn } from '../lib/utils'

// Breakpoints following Tailwind defaults
export const BREAKPOINTS = {
  'base': 0, // Default
  'sm': 640, // Small screens
  'md': 768, // Medium screens
  'lg': 1024, // Large screens
  'xl': 1280, // Extra large screens
  '2xl': 1536, // 2XL screens
} as const

/* -------------------------------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------------------------------- */
export type Breakpoint = keyof typeof BREAKPOINTS
export type GridDimension = number | string
export type GridTemplateValue = string | number | (string | number)[]
export type GridAutoFlow = 'row' | 'column' | 'dense' | 'row dense' | 'column dense'
export type GridAlignment = 'start' | 'end' | 'center' | 'stretch' | 'baseline'
export type GridJustification = 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'
export type GridPlacement = number | `${number}` | 'auto' | `span ${number}` | `${number} / ${number}` | `${number} / span ${number}`
export type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>

interface GridContextValue {
  readonly debug: boolean
  readonly currentBreakpoint: Breakpoint
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * ----------------------------------------------------------------------------------------------- */
const GridContext = createContext<GridContextValue | null>(null)

function useGrid() {
  const context = useContext(GridContext)
  if (!context) {
    throw new Error('Grid components must be used within a Grid.Root component')
  }
  return context
}

/**
 * Determines the current breakpoint based on window width
 */
function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('base')

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      const width = window.innerWidth
      const entries = Object.entries(BREAKPOINTS) as [Breakpoint, number][]
      // Find the largest breakpoint that's smaller than the current width
      const newBreakpoint = entries
        .filter(([, value]) => width >= value)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'base'

      setBreakpoint(newBreakpoint)
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}

/* -------------------------------------------------------------------------------------------------
 * Utility functions
 * ----------------------------------------------------------------------------------------------- */

/**
 * Converts a responsive property to CSS variables
 */
function generateResponsiveCSS<T>(
  prop: ResponsiveProp<T> | undefined,
  cssProperty: string,
  transform: (value: T) => string = String as any,
): Record<string, string> {
  if (prop === undefined)
    return {}

  const result: Record<string, string> = {}

  if (typeof prop === 'object' && prop !== null) {
    // Type assertion to help TypeScript understand this is a record
    const responsiveObj = prop as Record<string, T>

    // For each breakpoint, create a CSS variable
    Object.entries(responsiveObj).forEach(([bp, value]) => {
      if (bp in BREAKPOINTS) {
        // Use string indexing for custom properties
        result[`--grid-${bp}-${cssProperty}`] = transform(value)
      }
    })

    // Set the base property using CSS variables and fallbacks
    const breakpoints = Object.keys(BREAKPOINTS) as Breakpoint[]
    const cssVars = breakpoints
      .map(bp => `var(--grid-${bp}-${cssProperty}, undefined)`)
      .join(', ')

    // Use a more general type for custom CSS properties
    result[cssProperty] = `resolveResponsive(${cssVars})`
  }
  else {
    // For a single value, just set the property directly
    result[cssProperty] = transform(prop as T)
  }

  return result
}

/**
 * Transforms grid template values into CSS-compatible strings
 */
function transformGridTemplate(value: GridTemplateValue): string {
  if (typeof value === 'number') {
    return `repeat(${value}, 1fr)`
  }
  else if (Array.isArray(value)) {
    return value.map(item =>
      typeof item === 'number' ? `${item}fr` : item,
    ).join(' ')
  }
  return value
}

/**
 * Transforms gap values into CSS-compatible strings
 */
function transformGap(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Root
 * ----------------------------------------------------------------------------------------------- */
export interface GridRootProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Enable debug mode to visualize grid lines
   */
  debug?: boolean
  /**
   * Children to render within the grid system
   */
  children?: ReactNode
}

/**
 * Root component for the Grid system.
 * Provides context and settings for nested Grid components.
 */
const GridRoot: React.FC<React.ComponentProps<'div'> & GridRootProps> = ({
  debug = false,
  children,
  className,
  ...props
}) => {
  const currentBreakpoint = useBreakpoint()

  // Create context value
  const contextValue = useMemo(() => ({
    debug,
    currentBreakpoint,
  }), [debug, currentBreakpoint])

  return (
    <GridContext value={contextValue}>
      <div
        className={cn('grid-system', className)}
        data-grid-root=""
        data-breakpoint={currentBreakpoint}
        {...props}
      >
        {children}
      </div>
    </GridContext>
  )
}

GridRoot.displayName = 'Grid.Root'

/* -------------------------------------------------------------------------------------------------
 * Grid.Container
 * ----------------------------------------------------------------------------------------------- */
export interface GridContainerProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Define the grid columns
   * @example columns={3} or columns={{ base: 1, md: 2, lg: 3 }}
   */
  columns?: ResponsiveProp<GridTemplateValue>
  /**
   * Define the grid rows
   * @example rows="auto 1fr auto" or rows={{ base: "auto", md: "auto 1fr" }}
   */
  rows?: ResponsiveProp<GridTemplateValue>
  /**
   * Define the grid template areas
   * @example areas={`"header header" "sidebar content" "footer footer"`}
   */
  areas?: ResponsiveProp<string>
  /**
   * Set both column and row gaps
   */
  gap?: ResponsiveProp<string | number>
  /**
   * Set column gaps
   */
  columnGap?: ResponsiveProp<string | number>
  /**
   * Set row gaps
   */
  rowGap?: ResponsiveProp<string | number>
  /**
   * Control how auto-placed items are flowed into the grid
   */
  autoFlow?: ResponsiveProp<GridAutoFlow>
  /**
   * Control the size of implicitly created rows
   */
  autoRows?: ResponsiveProp<string>
  /**
   * Control the size of implicitly created columns
   */
  autoColumns?: ResponsiveProp<string>
  /**
   * Align grid items along the inline (row) axis
   */
  justifyItems?: ResponsiveProp<GridJustification>
  /**
   * Align grid items along the block (column) axis
   */
  alignItems?: ResponsiveProp<GridAlignment>
  /**
   * Align the grid along the inline (row) axis
   */
  justifyContent?: ResponsiveProp<GridJustification>
  /**
   * Align the grid along the block (column) axis
   */
  alignContent?: ResponsiveProp<GridAlignment>
  /**
   * Children to render within the grid container
   */
  children?: ReactNode
}

/**
 * Grid container component that creates a CSS Grid layout.
 * Supports all CSS Grid properties with responsive capabilities.
 */
const GridContainer: React.FC<React.ComponentProps<'div'> & GridContainerProps> = ({
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
  className,
  style,
  children,
  ...props
}) => {
  const { debug } = useGrid()

  // Generate CSS properties for grid container
  const gridStyles = useMemo(() => {
    return {
      ...generateResponsiveCSS(columns, 'grid-template-columns', transformGridTemplate),
      ...generateResponsiveCSS(rows, 'grid-template-rows', transformGridTemplate),
      ...generateResponsiveCSS(areas, 'grid-template-areas'),
      ...generateResponsiveCSS(gap, 'gap', transformGap),
      ...generateResponsiveCSS(columnGap, 'column-gap', transformGap),
      ...generateResponsiveCSS(rowGap, 'row-gap', transformGap),
      ...generateResponsiveCSS(autoFlow, 'grid-auto-flow'),
      ...generateResponsiveCSS(autoRows, 'grid-auto-rows'),
      ...generateResponsiveCSS(autoColumns, 'grid-auto-columns'),
      ...generateResponsiveCSS(justifyItems, 'justify-items'),
      ...generateResponsiveCSS(alignItems, 'align-items'),
      ...generateResponsiveCSS(justifyContent, 'justify-content'),
      ...generateResponsiveCSS(alignContent, 'align-content'),
      display: 'grid',
      ...style,
    } as React.CSSProperties
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
    style,
  ])

  return (
    <div
      className={cn('grid-container', debug && 'grid-debug', className)}
      style={gridStyles}
      data-grid-container=""
      {...props}
    >
      {debug && <GridDebugOverlay columns={columns} rows={rows} />}
      {children}
    </div>
  )
}

GridContainer.displayName = 'Grid.Container'

/* -------------------------------------------------------------------------------------------------
 * Grid.Item
 * ----------------------------------------------------------------------------------------------- */
export interface GridItemProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Set the column position and span
   * @example column="1 / 3" or column={{ base: 1, md: "1 / 3" }}
   */
  column?: ResponsiveProp<GridPlacement>
  /**
   * Set the row position and span
   * @example row="2 / span 2" or row={{ base: 2, md: "2 / span 2" }}
   */
  row?: ResponsiveProp<GridPlacement>
  /**
   * Set the column start position
   */
  columnStart?: ResponsiveProp<GridPlacement>
  /**
   * Set the column end position
   */
  columnEnd?: ResponsiveProp<GridPlacement>
  /**
   * Set the row start position
   */
  rowStart?: ResponsiveProp<GridPlacement>
  /**
   * Set the row end position
   */
  rowEnd?: ResponsiveProp<GridPlacement>
  /**
   * Set the grid area for the item
   * @example area="header" or area={{ base: "content", lg: "sidebar" }}
   */
  area?: ResponsiveProp<string>
  /**
   * Set the order of the item
   */
  order?: ResponsiveProp<number>
  /**
   * Align the item along the inline (row) axis
   */
  justifySelf?: ResponsiveProp<GridJustification>
  /**
   * Align the item along the block (column) axis
   */
  alignSelf?: ResponsiveProp<GridAlignment>
  /**
   * Children to render within the grid item
   */
  children?: ReactNode
}

/**
 * Grid item component that positions content within a grid.
 * Supports all CSS Grid item properties with responsive capabilities.
 */
const GridItem: React.FC<React.ComponentProps<'div'> & GridItemProps> = ({
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
  className,
  style,
  children,
  ...props
}) => {
  // Generate CSS properties for grid item
  const itemStyles = useMemo(() => {
    return {
      ...generateResponsiveCSS(column, 'grid-column'),
      ...generateResponsiveCSS(row, 'grid-row'),
      ...generateResponsiveCSS(columnStart, 'grid-column-start'),
      ...generateResponsiveCSS(columnEnd, 'grid-column-end'),
      ...generateResponsiveCSS(rowStart, 'grid-row-start'),
      ...generateResponsiveCSS(rowEnd, 'grid-row-end'),
      ...generateResponsiveCSS(area, 'grid-area'),
      ...generateResponsiveCSS(order, 'order'),
      ...generateResponsiveCSS(justifySelf, 'justify-self'),
      ...generateResponsiveCSS(alignSelf, 'align-self'),
      ...style,
    } as React.CSSProperties
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
    style,
  ])

  return (
    <div
      className={cn('grid-item', className)}
      style={itemStyles}
      data-grid-item=""
      {...props}
    >
      {children}
    </div>
  )
}

GridItem.displayName = 'Grid.Item'

/* -------------------------------------------------------------------------------------------------
 * Grid.Area
 * ----------------------------------------------------------------------------------------------- */
export interface GridAreaProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * The name of the grid area
   */
  name: string
  /**
   * Children to render within the grid area
   */
  children?: ReactNode
}

/**
 * Grid area component for creating named template areas.
 * Simplifies the usage of grid-template-areas.
 */
const GridArea: React.FC<React.ComponentProps<'div'> & GridAreaProps> = ({
  name,
  className,
  style,
  children,
  ...props
}) => {
  const areaStyles = useMemo(() => ({
    gridArea: name,
    ...style,
  } as React.CSSProperties), [name, style])

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

GridArea.displayName = 'Grid.Area'

/* -------------------------------------------------------------------------------------------------
* Grid.Debug
* ----------------------------------------------------------------------------------------------- */
interface GridDebugOverlayProps {
  columns?: ResponsiveProp<GridTemplateValue>
  rows?: ResponsiveProp<GridTemplateValue>
}

/**
 * Helper component to visualize grid lines and areas for debugging
 */
function GridDebugOverlay({ columns, rows }: Readonly<GridDebugOverlayProps>) {
  const { currentBreakpoint } = useGrid()
  const [gridLines, setGridLines] = useState<{ cols: number, rows: number }>({ cols: 0, rows: 0 })

  // Parse grid template values to determine number of lines
  useEffect(() => {
    const parseTemplateValue = (value: ResponsiveProp<GridTemplateValue> | undefined, bp: Breakpoint): number => {
      if (value === undefined)
        return 0

      // Handle responsive object
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Type assertion for proper access
        const responsiveValue = value
        const bpValue = responsiveValue[bp] || responsiveValue.base
        if (bpValue === undefined)
          return 0
        return parseTemplateValue(bpValue, bp)
      }

      // At this point, value is a GridTemplateValue
      // Handle number (repeat(n, 1fr))
      if (typeof value === 'number') {
        return value
      }

      // Handle array
      if (Array.isArray(value)) {
        return value.length
      }

      // Handle string - this is a simplified approach
      const repeatMatch = /repeat\((\d+)/.exec(value)
      if (repeatMatch) {
        return Number.parseInt(repeatMatch[1], 10)
      }

      // Count the number of spaces + 1 as a rough estimate for explicit tracks
      return value.split(' ').length
    }

    // Fix for rows variable being used before declaration
    const colCount = parseTemplateValue(columns, currentBreakpoint)
    const rowCount = parseTemplateValue(rows, currentBreakpoint)

    setGridLines({ cols: colCount, rows: rowCount })
  }, [columns, rows, currentBreakpoint])

  return (
    <div
      className="grid-debug-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999,
      } as React.CSSProperties}
      data-grid-debug=""
    >
      {/* Column lines */}
      {Array.from({ length: gridLines.cols + 1 }).map((_, i) => (
        <div
          key={`col-line-${i}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${(i / gridLines.cols) * 100}%`,
            width: '1px',
            backgroundColor: 'rgba(0, 100, 255, 0.2)',
            zIndex: 1000,
          } as React.CSSProperties}
          data-grid-debug-line="column"
        />
      ))}

      {/* Row lines */}
      {Array.from({ length: gridLines.rows + 1 }).map((_, i) => (
        <div
          key={`row-line-${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${(i / gridLines.rows) * 100}%`,
            height: '1px',
            backgroundColor: 'rgba(0, 100, 255, 0.2)',
            zIndex: 1000,
          } as React.CSSProperties}
          data-grid-debug-line="row"
        />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
* Grid.Stack
* ----------------------------------------------------------------------------------------------- */
export interface GridStackProps extends ComponentPropsWithoutRef<'div'> {
/**
 * Children to stack in the same grid cell
 */
  children?: ReactNode
}

/**
 * A utility component that stacks children on top of each other
 * in the same grid cell using absolute positioning.
 *
 * Instead of cloning children with modified styles, this component
 * wraps each child in a div with the appropriate positioning.
 */
const GridStack: React.FC<React.ComponentProps<'div'> & GridStackProps> = ({
  className,
  style,
  children,
  ...props
}) => {
  const stackStyles = useMemo(() => ({
    position: 'relative',
    ...style,
  } as React.CSSProperties), [style])

  return (
    <div
      className={cn('grid-stack', className)}
      style={stackStyles}
      data-grid-stack=""
      {...props}
    >
      {/* Use a wrapper div for each child instead of cloning */}
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={`stack-item-${index}`}
              style={{
                position: 'absolute',
                inset: 0,
              } as React.CSSProperties}
              data-grid-stack-item=""
            >
              {child}
            </div>
          ))
        : children && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
            } as React.CSSProperties}
            data-grid-stack-item=""
          >
            {children}
          </div>
        )}
    </div>
  )
}

GridStack.displayName = 'Grid.Stack'

/* -------------------------------------------------------------------------------------------------
* Grid.CSSVariables
* ----------------------------------------------------------------------------------------------- */
function GridCSSVariables() {
  return (
    // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
    <style dangerouslySetInnerHTML={{
      __html: `
      /* CSS to handle responsive props using CSS variables */
      :root {
        --grid-current-breakpoint: 'base';
      }

      @media (min-width: ${BREAKPOINTS.sm}px) {
        :root {
          --grid-current-breakpoint: 'sm';
        }
      }

      @media (min-width: ${BREAKPOINTS.md}px) {
        :root {
          --grid-current-breakpoint: 'md';
        }
      }

      @media (min-width: ${BREAKPOINTS.lg}px) {
        :root {
          --grid-current-breakpoint: 'lg';
        }
      }

      @media (min-width: ${BREAKPOINTS.xl}px) {
        :root {
          --grid-current-breakpoint: 'xl';
        }
      }

      @media (min-width: ${BREAKPOINTS['2xl']}px) {
        :root {
          --grid-current-breakpoint: '2xl';
        }
      }

      /* Helper function for responsive variables */
      @property --grid-selected-value {
        syntax: "*";
        initial-value: "";
        inherits: false;
      }

      [data-grid-root], [data-grid-container], [data-grid-item], [data-grid-area] {
        --grid-selected-value: '';
      }

      /* Debug styles */
      [data-grid-container].grid-debug {
        position: relative;
        outline: 1px dashed rgba(0, 100, 255, 0.3);
      }

      [data-grid-item].grid-debug {
        outline: 1px dotted rgba(255, 0, 100, 0.3);
      }
    `,
    }}
    />
  )
}

GridCSSVariables.displayName = 'Grid.CSSVariables'

/* -------------------------------------------------------------------------------------------------
* Exports
* ----------------------------------------------------------------------------------------------- */
export const Grid = {
  Root: GridRoot,
  Container: GridContainer,
  Item: GridItem,
  Area: GridArea,
  Stack: GridStack,
  CSSVariables: GridCSSVariables,
}

// Also export hooks and utilities for advanced usage
export {
  generateResponsiveCSS,
  transformGap,
  transformGridTemplate,
  useBreakpoint,
  useGrid,
}
