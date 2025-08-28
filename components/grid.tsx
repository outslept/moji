'use client'

import type { CSSProperties, ReactNode } from 'react'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  Children,
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
  type GridSelfAlignment,
  type GridContentDistribution,
  type GridAutoFlow,
  type GridPlacement,
  type SpacingPreset,
  containerStyle,
  itemStyle,
  resolve,
} from '../utils/styles'
import { useRect } from '@/utils/use-rect'

function isMutableRefObject<T>(ref: React.Ref<T> | undefined): ref is React.MutableRefObject<T | null> {
  return typeof ref === 'object' && ref !== null && 'current' in ref
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
  } else if (isMutableRefObject(ref)) {
    ref.current = value
  }
}

type WithClassStyle = {
  className?: string
  style?: React.CSSProperties
}

type SlotProps<P extends WithClassStyle> = {
  children: React.ReactElement<P>
  className?: string
  style?: React.CSSProperties
  slotRef?: React.Ref<HTMLElement | null>
} & Partial<Omit<P, keyof WithClassStyle>>

function Slot<P extends WithClassStyle>({
  children,
  className,
  style,
  slotRef,
  ...rest
}: SlotProps<P>) {
  const mergedClassName = cn(children.props.className, className)
  const mergedStyle: React.CSSProperties = {
    ...(children.props.style ?? {}),
    ...(style ?? {}),
  }

  // TS can't prove that adding className/style/ref keeps the shape as Partial<P> :/
  const nextProps = {
    ...rest,
    className: mergedClassName,
    style: mergedStyle,
    ref: slotRef,
  } as unknown as Partial<P> & React.Attributes

  return React.cloneElement(children, nextProps)
}
Slot.displayName = 'Slot'

/* -------------------------------------------------------------------------------------------------
 * Context
 * ----------------------------------------------------------------------------------------------- */

interface CtxValue {
  bp: Breakpoint
  space: SpacingPreset
  rootRef: React.MutableRefObject<HTMLElement | null>
}

const Ctx = createContext<CtxValue | null>(null)
export function useGrid() {
  const v = useContext(Ctx)
  if (!v) throw new Error('Grid components must be used within Grid.Root')
  return v
}

function useContainerBreakpoint(el: HTMLElement | null): Breakpoint {
  const rect = useRect(el)
  const width = rect?.width ?? 0
  return useMemo(() => pickBp(width), [width])
}

export interface GridRootProps extends React.ComponentPropsWithoutRef<'div'> {
  ref?: React.Ref<HTMLElement>
  asChild?: boolean
  spacing?: SpacingPreset
  onBreakpointChange?: (bp: Breakpoint) => void
  children?: ReactNode
}

function GridRoot(props: GridRootProps) {
  const {
    asChild,
    spacing,
    onBreakpointChange,
    className,
    children,
    ref,
    ...domProps
  } = props

  const internalRef = useRef<HTMLElement | null>(null)
  const bp = useContainerBreakpoint(internalRef.current)

  useEffect(() => {
    onBreakpointChange?.(bp)
  }, [bp, onBreakpointChange])

  const ctx = useMemo(
    () => ({
      bp,
      space: spacing ?? 'standard',
      rootRef: internalRef,
    }),
    [spacing, bp],
  )

  const handleSlotRef: React.Ref<HTMLElement | null> = (node) => {
    setRef(ref, node)
    internalRef.current = node
  }

  if (asChild) {
    return (
      <Ctx.Provider value={ctx}>
        <Slot
          slotRef={handleSlotRef}
          className={cn(
            'font-sans text-foreground bg-background transition-colors duration-200',
            className,
          )}
          data-grid-root=""
          data-breakpoint={bp}
          {...domProps as Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'style'>}
        >
          {children as React.ReactElement<WithClassStyle>}
        </Slot>
      </Ctx.Provider>
    )
  }

  return (
    <Ctx.Provider value={ctx}>
      <div
        ref={(node) => {
          setRef(ref, node)
          internalRef.current = node
        }}
        className={cn(
          'font-sans text-foreground bg-background transition-colors duration-200',
          className,
        )}
        data-grid-root=""
        data-breakpoint={bp}
        {...domProps}
      >
        {children}
      </div>
    </Ctx.Provider>
  )
}
GridRoot.displayName = 'Grid.Root'

type GridVariant = 'grid' | 'auto' | 'masonry'

export interface GridContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  ref?: React.Ref<HTMLElement>
  asChild?: boolean
  variant?: GridVariant

  columns?: ResponsiveProp<GridColumns>
  rows?: ResponsiveProp<GridRows>
  areas?: ResponsiveProp<string>
  gap?: ResponsiveProp<GridGap> | SpacingPreset
  columnGap?: ResponsiveProp<GridGap>
  rowGap?: ResponsiveProp<GridGap>
  autoFlow?: ResponsiveProp<GridAutoFlow>
  autoRows?: ResponsiveProp<string>
  autoColumns?: ResponsiveProp<string>
  justifyItems?: ResponsiveProp<GridSelfAlignment>
  alignItems?: ResponsiveProp<GridSelfAlignment>
  justifyContent?: ResponsiveProp<GridContentDistribution>
  alignContent?: ResponsiveProp<GridContentDistribution>
  aspectRatio?: string

  minItemWidth?: ResponsiveProp<string>
  maxItemWidth?: ResponsiveProp<string>

  masonryColumns?: ResponsiveProp<number>

  children?: ReactNode
}

function GridContainer(props: GridContainerProps) {
  const { bp, space } = useGrid()
  const {
    ref,
    asChild,
    variant = 'grid',

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
    aspectRatio,

    minItemWidth,
    maxItemWidth,

    masonryColumns,

    className,
    style,
    children,
    ...domProps
  } = props

  const st = useMemo((): CSSProperties => {
    if (variant === 'auto') {
      const min = resolve(minItemWidth, bp) ?? '250px'
      const max = resolve(maxItemWidth, bp) ?? '1fr'
      const stx = containerStyle(
        {
          gap,
          columnGap,
          rowGap,
          rows,
          areas,
          autoFlow,
          autoRows,
          autoColumns,
          justifyItems,
          alignItems,
          justifyContent,
          alignContent,
          aspectRatio,
          style,
        },
        bp,
        space,
      )
      stx.display = 'grid'
      stx.gridTemplateColumns = `repeat(auto-fit, minmax(${min}, ${max}))`
      return stx
    }

    if (variant === 'masonry') {
      const cols = resolve(masonryColumns, bp) ?? 1
      const stx = containerStyle(
        {
          gap,
          columnGap,
          rowGap,
          rows,
          areas,
          autoFlow,
          autoRows: 'max-content',
          autoColumns,
          justifyItems,
          alignItems,
          justifyContent,
          alignContent,
          aspectRatio,
          style,
        },
        bp,
        space,
      )
      stx.display = 'grid'
      stx.gridTemplateColumns = `repeat(${cols}, 1fr)`
      return stx
    }

    return containerStyle(
      {
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
        aspectRatio,
        style,
      },
      bp,
      space,
    )
  }, [
    variant,
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
    aspectRatio,
    minItemWidth,
    maxItemWidth,
    masonryColumns,
    bp,
    space,
    style,
  ])

  if (asChild) {
    return (
      <Slot
        slotRef={(node) => setRef(ref, node)}
        className={cn('grid relative transition-all duration-200', className)}
        style={st}
        data-grid-container=""
        data-grid-variant={variant}
        {...domProps as Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'style'>}
      >
        {children as React.ReactElement<WithClassStyle>}
      </Slot>
    )
  }

  return (
    <div
      ref={(node) => setRef(ref, node)}
      className={cn('grid relative transition-all duration-200', className)}
      style={st}
      data-grid-container=""
      data-grid-variant={variant}
      {...domProps}
    >
      {children}
    </div>
  )
}
GridContainer.displayName = 'Grid'

export interface GridItemProps extends React.ComponentPropsWithoutRef<'div'> {
  ref?: React.Ref<HTMLElement>
  asChild?: boolean
  column?: ResponsiveProp<GridPlacement>
  row?: ResponsiveProp<GridPlacement>
  columnStart?: ResponsiveProp<GridPlacement>
  columnEnd?: ResponsiveProp<GridPlacement>
  rowStart?: ResponsiveProp<GridPlacement>
  rowEnd?: ResponsiveProp<GridPlacement>
  area?: ResponsiveProp<string>
  order?: ResponsiveProp<number>
  justifySelf?: ResponsiveProp<GridSelfAlignment>
  alignSelf?: ResponsiveProp<GridSelfAlignment>
  span?: ResponsiveProp<number>
  rowSpan?: ResponsiveProp<number>
  aspectRatio?: string
  interactive?: boolean
  animate?: 'fadeIn' | 'slideUp' | 'scaleIn'
  children?: ReactNode
}

function GridItem(props: GridItemProps) {
  const { bp } = useGrid()
  const {
    ref,
    asChild,
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
    interactive,
    animate,
    className,
    style,
    children,
    ...domProps
  } = props

  const st = useMemo((): CSSProperties => {
    return itemStyle(
      {
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
        style,
      },
      bp,
    )
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
    style,
    bp,
  ])

  const anim =
    animate === 'fadeIn'
      ? s.fadeIn
      : animate === 'slideUp'
      ? s.slideUp
      : animate === 'scaleIn'
      ? s.scaleIn
      : undefined

  const cls = cn(
    'relative transition will-change-transform',
    interactive &&
      'cursor-pointer transition-transform transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
    anim,
    className,
  )

  if (asChild) {
    return (
      <Slot
        slotRef={(node) => setRef(ref, node)}
        className={cls}
        style={st}
        data-grid-item=""
        data-interactive={interactive ? '' : undefined}
        {...domProps as Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'style'>}
      >
        {children as React.ReactElement<WithClassStyle>}
      </Slot>
    )
  }

  return (
    <div
      ref={(node) => setRef(ref, node)}
      className={cls}
      style={st}
      data-grid-item=""
      data-interactive={interactive ? '' : undefined}
      {...domProps}
    >
      {children}
    </div>
  )
}
GridItem.displayName = 'Grid.Item'

export interface GridAreaProps extends React.ComponentPropsWithoutRef<'div'> {
  ref?: React.Ref<HTMLElement>
  asChild?: boolean
  name: string
  children?: ReactNode
}

function GridArea(props: GridAreaProps) {
  const { ref, asChild, name, className, style, children, ...domProps } = props
  const st = useMemo((): CSSProperties => ({ gridArea: name, ...style }), [name, style])

  if (asChild) {
    return (
      <Slot
        slotRef={(node) => setRef(ref, node)}
        className={cn('relative', className)}
        style={st}
        data-grid-area={name}
        {...domProps as Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'style'>}
      >
        {children as React.ReactElement<WithClassStyle>}
      </Slot>
    )
  }

  return (
    <div
      ref={(node) => setRef(ref, node)}
      className={cn('relative', className)}
      style={st}
      data-grid-area={name}
      {...domProps}
    >
      {children}
    </div>
  )
}
GridArea.displayName = 'Grid.Area'

export interface GridStackProps extends React.ComponentPropsWithoutRef<'div'> {
  ref?: React.Ref<HTMLElement>
  asChild?: boolean
  children?: ReactNode
}

function GridStack(props: GridStackProps) {
  const { ref, asChild, className, style, children, ...domProps } = props
  const st = useMemo((): CSSProperties => ({ position: 'relative', ...style }), [style])
  const kids = Array.isArray(children) ? children : children ? [children] : []

  if (asChild) {
    return (
      <Slot
        slotRef={(node: any) => setRef(ref, node)}
        className={cn('relative', className)}
        style={st}
        data-grid-stack=""
        {...domProps as Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'style'>}
      >
        <div className="relative">
          {Children.map(kids, (n, i) => (
            <div key={i} className="absolute inset-0" data-grid-stack-item="">
              {n}
            </div>
          ))}
        </div>
      </Slot>
    )
  }

  return (
    <div
      ref={(node) => setRef(ref, node)}
      className={cn('relative', className)}
      style={st}
      data-grid-stack=""
      {...domProps}
    >
      {Children.map(kids, (n, i) => (
        <div key={i} className="absolute inset-0" data-grid-stack-item="">
          {n}
        </div>
      ))}
    </div>
  )
}
GridStack.displayName = 'Grid.Stack'

type AliasProps = Omit<GridContainerProps, 'variant'>

function GridAutoGrid(p: AliasProps) {
  return <GridContainer {...p} variant="auto" />
}
GridAutoGrid.displayName = 'Grid.AutoGrid'

function GridMasonry(p: AliasProps) {
  return <GridContainer {...p} variant="masonry" />
}
GridMasonry.displayName = 'Grid.Masonry'

export const Grid = {
  Root: GridRoot,
  Container: GridContainer,
  AutoGrid: GridAutoGrid,
  Masonry: GridMasonry,
  Item: GridItem,
  Area: GridArea,
  Stack: GridStack,
}
