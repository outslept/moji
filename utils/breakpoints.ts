export const BREAKPOINTS = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS
export type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>

export function pickBp(w: number): Breakpoint {
  const arr = Object.entries(BREAKPOINTS) as [Breakpoint, number][]
  const cur = arr.filter(([, v]) => w >= v).sort((a, b) => b[1] - a[1])[0]?.[0]
  return cur ?? 'base'
}
