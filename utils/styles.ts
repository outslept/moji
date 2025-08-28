import type { CSSProperties } from 'react'
import type { Breakpoint, ResponsiveProp } from './breakpoints'

export type GridColumns = number | 'auto-fit' | 'auto-fill' | string | (string | number)[]
export type GridRows = number | 'auto' | string | (string | number)[]
export type GridGap = number | string
export type GridAlignment = 'start' | 'end' | 'center' | 'stretch' | 'baseline'
export type GridJustification =
  | 'start'
  | 'end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
export type GridAutoFlow = 'row' | 'column' | 'dense' | 'row dense' | 'column dense'
export type GridPlacement =
  | number
  | 'auto'
  | `span ${number}`
  | `${number} / ${number}`
  | `${number} / span ${number}`

export type SpacingPreset = 'none' | 'tight' | 'standard' | 'relaxed' | 'wide'

export interface ContainerIn {
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
  style?: CSSProperties
}

export interface ItemIn {
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
  style?: CSSProperties
}

export function resolve<T>(
  v: ResponsiveProp<T> | undefined,
  bp: Breakpoint,
): T | undefined {
  if (v === undefined) return undefined
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    const order: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'base']
    const i = order.indexOf(bp)
    const seq = order.slice(i)
    const k = seq.find(x => v[x] !== undefined)
    return k ? v[k] : undefined
  }
  return v as T
}

export function cols(v: GridColumns): string {
  if (typeof v === 'number') return `repeat(${v}, 1fr)`
  if (v === 'auto-fit') return 'repeat(auto-fit, minmax(250px, 1fr))'
  if (v === 'auto-fill') return 'repeat(auto-fill, minmax(250px, 1fr))'
  if (Array.isArray(v)) return v.map(x => (typeof x === 'number' ? `${x}fr` : x)).join(' ')
  return v
}

export function rows(v: GridRows): string {
  if (typeof v === 'number') return `repeat(${v}, 1fr)`
  if (v === 'auto') return 'auto'
  if (Array.isArray(v)) return v.map(x => (typeof x === 'number' ? `${x}fr` : x)).join(' ')
  return v
}

export function gap(v: GridGap): string {
  return typeof v === 'number' ? `${v}px` : v
}

export function space(p: SpacingPreset): string {
  const map: Record<SpacingPreset, string> = {
    none: '0px',
    tight: '8px',
    standard: '16px',
    relaxed: '24px',
    wide: '32px',
  }
  return map[p]
}

export function gapVal(
  g: ResponsiveProp<GridGap> | SpacingPreset | undefined,
  bp: Breakpoint,
  sp: SpacingPreset,
): string {
  const presets: SpacingPreset[] = ['none', 'tight', 'standard', 'relaxed', 'wide']
  const isPreset = typeof g === 'string' && presets.includes(g as SpacingPreset)
  if (isPreset) return space(g as SpacingPreset)
  const v = resolve(g as ResponsiveProp<GridGap>, bp)
  if (v !== undefined) return gap(v)
  return space(sp)
}

export function containerStyle(
  p: ContainerIn,
  bp: Breakpoint,
  sp: SpacingPreset,
): CSSProperties {
  const c = resolve(p.columns, bp)
  const r = resolve(p.rows, bp)
  const a = resolve(p.areas, bp)

  const g = gapVal(p.gap, bp, sp)
  const st: CSSProperties = { display: 'grid', gap: g }

  if (c) st.gridTemplateColumns = cols(c)
  if (r) st.gridTemplateRows = rows(r)
  if (a) st.gridTemplateAreas = a

  if (c === 'auto-fit' || c === 'auto-fill') {
    const min = p.minItemWidth ?? '250px'
    const max = p.maxItemWidth ?? '1fr'
    st.gridTemplateColumns = `repeat(${c}, minmax(${min}, ${max}))`
  }

  const cg = resolve(p.columnGap, bp)
  if (cg) st.columnGap = gap(cg)

  const rg = resolve(p.rowGap, bp)
  if (rg) st.rowGap = gap(rg)

  const af = resolve(p.autoFlow, bp)
  if (af) st.gridAutoFlow = af

  const ar = resolve(p.autoRows, bp)
  if (ar) st.gridAutoRows = ar

  const ac = resolve(p.autoColumns, bp)
  if (ac) st.gridAutoColumns = ac

  const ji = resolve(p.justifyItems, bp)
  if (ji) st.justifyItems = ji

  const ai = resolve(p.alignItems, bp)
  if (ai) st.alignItems = ai

  const jc = resolve(p.justifyContent, bp)
  if (jc) st.justifyContent = jc

  const al = resolve(p.alignContent, bp)
  if (al) st.alignContent = al

  if (p.aspectRatio) st.aspectRatio = p.aspectRatio

  const m = p.style
  return m ? { ...st, ...m } : st
}

export function itemStyle(p: ItemIn, bp: Breakpoint): CSSProperties {
  const st: CSSProperties = {}

  const sp = resolve(p.span, bp)
  if (sp) st.gridColumn = `span ${sp}`

  const rsp = resolve(p.rowSpan, bp)
  if (rsp) st.gridRow = `span ${rsp}`

  const c = resolve(p.column, bp)
  if (c) st.gridColumn = String(c)

  const r = resolve(p.row, bp)
  if (r) st.gridRow = String(r)

  const cs = resolve(p.columnStart, bp)
  if (cs) st.gridColumnStart = String(cs)

  const ce = resolve(p.columnEnd, bp)
  if (ce) st.gridColumnEnd = String(ce)

  const rs = resolve(p.rowStart, bp)
  if (rs) st.gridRowStart = String(rs)

  const re = resolve(p.rowEnd, bp)
  if (re) st.gridRowEnd = String(re)

  const a = resolve(p.area, bp)
  if (a) st.gridArea = a

  const o = resolve(p.order, bp)
  if (o !== undefined) st.order = o

  const js = resolve(p.justifySelf, bp)
  if (js) st.justifySelf = js

  const al = resolve(p.alignSelf, bp)
  if (al) st.alignSelf = al

  if (p.aspectRatio) st.aspectRatio = p.aspectRatio

  const m = p.style
  return m ? { ...st, ...m } : st
}
