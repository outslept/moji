'use client'

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
} from 'react'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Children,
  forwardRef,
} from 'react'
import { cn } from '../utils/cn'
import s from './grid.module.css'

import {
  type Breakpoint,
  type ResponsiveProp,
  pickBp,
} from '../utils/breakpoints'
import {
  type GridColumns,
  type GridRows,
  type GridGap,
  type GridAlignment,
  type GridJustification,
  type GridAutoFlow,
  type GridPlacement,
  type SpacingPreset,
  containerStyle,
  itemStyle,
} from '../utils/styles'
import { readGrid } from '../utils/debug'

/* -------------------------------------------------------------------------------------------------
 * Context
 * ----------------------------------------------------------------------------------------------- */

interface CtxValue {
  debug: boolean
  bp: Breakpoint
  space: SpacingPreset
}

const Ctx = createContext<CtxValue | null>(null)

export function useGrid() {
  const v = useContext(Ctx)
  if (!v) throw new Error('Grid components must be used within Grid.Root')
  return v
}

/* -------------------------------------------------------------------------------------------------
 * Hooks
 * ----------------------------------------------------------------------------------------------- */

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('base')

  useEffect(() => {
    const pick = () => setBp(pickBp(window.innerWidth))
    pick()
    window.addEventListener('resize', pick)
    return () => window.removeEventListener('resize', pick)
  }, [])

  return bp
}

/* -------------------------------------------------------------------------------------------------
 * Grid.Root
 * ----------------------------------------------------------------------------------------------- */

export interface GridRootProps extends ComponentPropsWithoutRef<'div'> {
  debug?: boolean
  spacing?: SpacingPreset
  children?: ReactNode
}

const GridRoot = forwardRef<HTMLDivElement, GridRootProps>((p, ref) => {
  const bp = useBreakpoint()
  const v = useMemo(
    () => ({
      debug: p.debug ?? false,
      bp,
      space: p.spacing ?? 'standard',
    }),
    [p.debug, p.spacing, bp],
  )

  return (
    <Ctx.Provider value={v}>
      <div
        ref={ref}
        className={cn(
          'font-sans text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors duration-200',
          p.className,
        )}
        data-grid-root=""
        data-breakpoint={bp}
        data-debug={v.debug ? '' : undefined}
        {...p}
      >
        {p.children}
      </div>
    </Ctx.Provider>
  )
})
GridRoot.displayName = 'Grid.Root'

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

const GridContainer = forwardRef<HTMLDivElement, GridContainerProps>((p, ref) => {
  const { debug, bp, space } = useGrid()

  const st = useMemo((): CSSProperties => {
    return containerStyle(
      {
        columns: p.columns,
        rows: p.rows,
        areas: p.areas,
        gap: p.gap,
        columnGap: p.columnGap,
        rowGap: p.rowGap,
        autoFlow: p.autoFlow,
        autoRows: p.autoRows,
        autoColumns: p.autoColumns,
        justifyItems: p.justifyItems,
        alignItems: p.alignItems,
        justifyContent: p.justifyContent,
        alignContent: p.alignContent,
        minItemWidth: p.minItemWidth,
        maxItemWidth: p.maxItemWidth,
        aspectRatio: p.aspectRatio,
        style: p.style,
      },
      bp,
      space,
    )
  }, [p, bp, space])

  return (
    <div
      ref={ref}
      className={cn(
        'grid relative transition-all duration-200',
        debug && 'bg-sky-500/5 border-2 border-dashed border-sky-500/40',
        p.className,
      )}
      style={st}
      data-grid-container=""
      {...p}
    >
      {debug && <GridDebugOverlay />}
      {p.children}
    </div>
  )
})
GridContainer.displayName = 'Grid.Container'

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
  animate?: 'fadeIn' | 'slideUp' | 'scaleIn'
  children?: ReactNode
}

const GridItem = forwardRef<HTMLDivElement, GridItemProps>((p, ref) => {
  const { debug, bp } = useGrid()

  const st = useMemo((): CSSProperties => {
    return itemStyle(
      {
        column: p.column,
        row: p.row,
        columnStart: p.columnStart,
        columnEnd: p.columnEnd,
        rowStart: p.rowStart,
        rowEnd: p.rowEnd,
        area: p.area,
        order: p.order,
        justifySelf: p.justifySelf,
        alignSelf: p.alignSelf,
        span: p.span,
        rowSpan: p.rowSpan,
        aspectRatio: p.aspectRatio,
        style: p.style,
      },
      bp,
    )
  }, [p, bp])

  const anim =
    p.animate === 'fadeIn' ? s.fadeIn : p.animate === 'slideUp' ? s.slideUp : p.animate === 'scaleIn' ? s.scaleIn : undefined

  return (
    <div
      ref={ref}
      className={cn(
        'relative transition will-change-transform',
        p.interactive &&
          'cursor-pointer transition-transform transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
        debug && 'bg-rose-500/5 border border-dotted border-sky-500/40',
        anim,
        p.className,
      )}
      style={st}
      data-grid-item=""
      data-interactive={p.interactive ? '' : undefined}
      {...p}
    >
      {p.children}
    </div>
  )
})
GridItem.displayName = 'Grid.Item'

/* -------------------------------------------------------------------------------------------------
 * Grid.Area
 * ----------------------------------------------------------------------------------------------- */

export interface GridAreaProps extends ComponentPropsWithoutRef<'div'> {
  name: string
  children?: ReactNode
}

const GridArea = forwardRef<HTMLDivElement, GridAreaProps>((p, ref) => {
  const st = useMemo((): CSSProperties => ({ gridArea: p.name, ...p.style }), [p.name, p.style])

  return (
    <div
      ref={ref}
      className={cn('relative', p.className)}
      style={st}
      data-grid-area={p.name}
      {...p}
    >
      {p.children}
    </div>
  )
})
GridArea.displayName = 'Grid.Area'

/* -------------------------------------------------------------------------------------------------
 * Grid.Stack
 * ----------------------------------------------------------------------------------------------- */

export interface GridStackProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode
}

const GridStack = forwardRef<HTMLDivElement, GridStackProps>((p, ref) => {
  const st = useMemo((): CSSProperties => ({ position: 'relative', ...p.style }), [p.style])
  const kids = Array.isArray(p.children) ? p.children : p.children ? [p.children] : []

  return (
    <div
      ref={ref}
      className={cn('relative', p.className)}
      style={st}
      data-grid-stack=""
      {...p}
    >
      {Children.map(kids, (n, i) => (
        <div key={i} className="absolute inset-0" data-grid-stack-item="">
          {n}
        </div>
      ))}
    </div>
  )
})
GridStack.displayName = 'Grid.Stack'

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

const GridAutoGrid = forwardRef<HTMLDivElement, GridAutoGridProps>((p, ref) => {
  const { bp, space } = useGrid()

  const st = useMemo((): CSSProperties => {
    const min = p.minItemWidth && typeof p.minItemWidth === 'object' ? (p.minItemWidth[bp] ?? p.minItemWidth.base ?? '250px') : (p.minItemWidth ?? '250px')
    const max = p.maxItemWidth && typeof p.maxItemWidth === 'object' ? (p.maxItemWidth[bp] ?? p.maxItemWidth.base ?? '1fr') : (p.maxItemWidth ?? '1fr')
    const gIn = { gap: p.gap } as const
    const stx = containerStyle(
      {
        ...gIn,
        aspectRatio: p.aspectRatio,
        style: p.style,
      },
      bp,
      space,
    )
    stx.display = 'grid'
    stx.gridTemplateColumns = `repeat(auto-fit, minmax(${min}, ${max}))`
    return stx
  }, [p, bp, space])

  return (
    <div
      ref={ref}
      className={cn('grid', p.className)}
      style={st}
      data-grid-auto=""
      {...p}
    >
      {p.children}
    </div>
  )
})
GridAutoGrid.displayName = 'Grid.AutoGrid'

/* -------------------------------------------------------------------------------------------------
 * Grid.Masonry
 * ----------------------------------------------------------------------------------------------- */

export interface GridMasonryProps extends ComponentPropsWithoutRef<'div'> {
  columns?: ResponsiveProp<number>
  gap?: ResponsiveProp<GridGap> | SpacingPreset
  children?: ReactNode
}

const GridMasonry = forwardRef<HTMLDivElement, GridMasonryProps>((p, ref) => {
  const { bp, space } = useGrid()

  const st = useMemo((): CSSProperties => {
    const cols = (typeof p.columns === 'object' && p.columns !== null ? (p.columns[bp] ?? p.columns.base) : p.columns) ?? 1
    const stx = containerStyle({ gap: p.gap, style: p.style }, bp, space)
    stx.display = 'grid'
    stx.gridTemplateColumns = `repeat(${cols}, 1fr)`
    stx.gridAutoRows = 'max-content'
    return stx
  }, [p, bp, space])

  return (
    <div
      ref={ref}
      className={cn('grid', p.className)}
      style={st}
      data-grid-masonry=""
      {...p}
    >
      {p.children}
    </div>
  )
})
GridMasonry.displayName = 'Grid.Masonry'

/* -------------------------------------------------------------------------------------------------
 * Grid.Debug
 * ----------------------------------------------------------------------------------------------- */

function GridDebugOverlay() {
  const ref = useRef<HTMLDivElement>(null)
  const [info, setInfo] = useState<{ columns: number; rows: number }>({ columns: 0, rows: 0 })

  useEffect(() => {
    const el = ref.current?.parentElement
    if (!el) return

    const upd = () => {
      const r = readGrid(el)
      setInfo({ columns: r.cols, rows: r.rows })
    }

    upd()
    const ro = new ResizeObserver(upd)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cols = info.columns > 0 ? info.columns : 1
  const rows = info.rows > 0 ? info.rows : 1

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none z-[9999]" data-grid-debug-overlay="">
      {Array.from({ length: cols + 1 }, (_, i) => (
        <div
          key={`col-${i}`}
          className="absolute top-0 bottom-0"
          style={{ left: `${(i / cols) * 100}%`, width: 1, backgroundColor: 'rgba(56, 189, 248, 0.35)' }}
          data-grid-debug-line="column"
        />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <div
          key={`row-${i}`}
          className="absolute left-0 right-0"
          style={{ top: `${(i / rows) * 100}%`, height: 1, backgroundColor: 'rgba(56, 189, 248, 0.35)' }}
          data-grid-debug-line="row"
        />
      ))}
    </div>
  )
}

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
}
