export function readGrid(el: HTMLElement): { cols: number; rows: number } {
  const cs = window.getComputedStyle(el)
  const gc = cs.gridTemplateColumns
  const gr = cs.gridTemplateRows

  const cols = gc && gc !== 'none' ? gc.split(' ').length : 0
  const rows = gr && gr !== 'none' ? gr.split(' ').length : 1

  return { cols, rows }
}
