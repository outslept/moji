'use client'

import React, { useState } from 'react'
import { Grid as BaseGrid } from '../components/grid'

type GridContainerProps = React.ComponentProps<typeof BaseGrid.Container>

function Holy(p: GridContainerProps) {
  const { children, ...rest } = p
  return (
    <BaseGrid.Container
      gap="standard"
      areas={{
        base: `
          "header"
          "main"
          "sidebar"
          "footer"
        `,
        md: `
          "header header"
          "main   sidebar"
          "footer footer"
        `,
      }}
      rows={{ base: 'auto 1fr auto auto', md: 'auto 1fr auto' }}
      columns={{ base: '1fr', md: '3fr 1fr' }}
      {...rest}
    >
      {children}
    </BaseGrid.Container>
  )
}

function Dashboard(p: GridContainerProps) {
  const { children, ...rest } = p
  return (
    <BaseGrid.Container
      gap="standard"
      areas={{
        base: `
          "nav"
          "main"
        `,
        md: `
          "nav main"
        `,
      }}
      rows={{ base: 'auto 1fr', md: '1fr' }}
      columns={{ base: '1fr', md: '240px 1fr' }}
      {...rest}
    >
      {children}
    </BaseGrid.Container>
  )
}

const Grid = { ...BaseGrid, Holy, Dashboard }

export default function GridExamplesPage() {
  const [currentSpacing, setCurrentSpacing] = useState<'none' | 'tight' | 'standard' | 'relaxed' | 'wide'>('standard')

  const card =
    'flex items-center justify-center rounded-xl border border-border bg-card p-4 text-sm text-card-foreground min-h-[56px] transition-colors hover:bg-card/90 dark:hover:bg-card/80'
  const area =
    'flex items-center justify-center rounded-xl border border-border bg-surface p-4 text-sm text-surface-foreground'
  const sectionWrap =
    'rounded-2xl border border-border bg-surface p-4 sm:p-6'

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight sm:text-2xl">Grid</h1>
            <div className="flex items-center gap-4">
              <label className="text-sm text-muted-foreground">
                <span className="mr-2">Spacing</span>
                <select
                  className="rounded-md border border-input bg-input/50 px-3 py-2 text-foreground outline-none ring-ring/0 focus-visible:ring-2"
                  value={currentSpacing}
                  onChange={e => setCurrentSpacing(e.target.value as any)}
                >
                  <option value="none">None</option>
                  <option value="tight">Tight</option>
                  <option value="standard">Standard</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="wide">Wide</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Basic Grid</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.Container columns={3}>
                <Grid.Item className={card}>Item 1</Grid.Item>
                <Grid.Item className={card}>Item 2</Grid.Item>
                <Grid.Item className={card}>Item 3</Grid.Item>
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Responsive Grid</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.Container columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <Grid.Item key={i} className={card}>
                    Card {i + 1}
                  </Grid.Item>
                ))}
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Spanning Items</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.Container columns={4}>
                <Grid.Item span={2} className={card}>Span 2 columns</Grid.Item>
                <Grid.Item className={card}>Regular</Grid.Item>
                <Grid.Item className={card}>Regular</Grid.Item>
                <Grid.Item span={3} className={card}>Span 3 columns</Grid.Item>
                <Grid.Item className={card}>Regular</Grid.Item>
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        {/* <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Auto-Fitting Grid</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.AutoGrid minItemWidth="200px">
                {Array.from({ length: 6 }, (_, i) => (
                  <Grid.Item key={i} className={card}>
                    Auto Item {i + 1}
                  </Grid.Item>
                ))}
              </Grid.AutoGrid>
            </Grid.Root>
          </div>
        </section> */}

        <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Holy Grail Layout</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.Holy>
                <Grid.Area name="header" className={`${area} border-l-2 border-l-primary`}>Header</Grid.Area>
                <Grid.Area name="sidebar" className={`${area} border-l-2 border-l-accent`}>Sidebar</Grid.Area>
                <Grid.Area name="main" className={area}>Main Content</Grid.Area>
                <Grid.Area name="footer" className={area}>Footer</Grid.Area>
              </Grid.Holy>
            </Grid.Root>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Dashboard Layout</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.Dashboard>
                <Grid.Area name="nav" className={`${area} border-l-2 border-l-secondary`}>Navigation</Grid.Area>
                <Grid.Area name="main" className={area}>
                  <Grid.Container columns={{ base: 1, md: 2, lg: 3 }}>
                    <Grid.Item className={card}>Metric 1</Grid.Item>
                    <Grid.Item className={card}>Metric 2</Grid.Item>
                    <Grid.Item className={card}>Metric 3</Grid.Item>
                  </Grid.Container>
                </Grid.Area>
              </Grid.Dashboard>
            </Grid.Root>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Complex Layout with Named Areas</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.Container
                areas={{
                  base: `
                    "header"
                    "hero"
                    "content"
                    "sidebar"
                    "footer"
                  `,
                  md: `
                    "header header"
                    "hero   hero"
                    "content sidebar"
                    "footer footer"
                  `,
                  lg: `
                    "header header header"
                    "hero   hero   sidebar"
                    "content content sidebar"
                    "footer footer footer"
                  `,
                }}
                rows={{
                  base: 'auto auto 1fr auto auto',
                  md: 'auto auto 1fr auto',
                  lg: 'auto 200px 1fr auto',
                }}
                columns={{
                  base: '1fr',
                  md: '2fr 1fr',
                  lg: '1fr 1fr 300px',
                }}
              >
                <Grid.Area name="header" className={`${area} border-l-2 border-l-primary`}>Header</Grid.Area>
                <Grid.Area name="hero" className={area}>Hero Section</Grid.Area>
                <Grid.Area name="content" className={area}>Main Content</Grid.Area>
                <Grid.Area name="sidebar" className={`${area} border-l-2 border-l-accent`}>Sidebar</Grid.Area>
                <Grid.Area name="footer" className={area}>Footer</Grid.Area>
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>
{/*
        <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Interactive Grid</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.Container columns={{ base: 2, md: 3, lg: 4 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <Grid.Item key={i} interactive className={`${card} shadow-sm`}>
                    Interactive {i + 1}
                  </Grid.Item>
                ))}
              </Grid.Container>
            </Grid.Root>
          </div>
        </section> */}

        <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Nested Grids</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.Container columns={{ base: 1, lg: 2 }}>
                <Grid.Item className={card}>
                  <div className="mb-3 text-sm font-medium">Nested Grid Container</div>
                  <Grid.Container columns={2} gap="tight">
                    <Grid.Item className={card}>Nested 1</Grid.Item>
                    <Grid.Item className={card}>Nested 2</Grid.Item>
                    <Grid.Item span={2} className={card}>Nested Wide</Grid.Item>
                  </Grid.Container>
                </Grid.Item>
                <Grid.Item className={card}>Regular Item</Grid.Item>
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold tracking-tight">Responsive Patterns</h2>
          <div className={sectionWrap}>
            <Grid.Root spacing={currentSpacing}>
              <Grid.Container columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }}>
                <Grid.Item span={{ base: 1, sm: 2, md: 1, lg: 2, xl: 2 }} className={card}>
                  Responsive Spanning
                </Grid.Item>
                {Array.from({ length: 10 }, (_, i) => (
                  <Grid.Item key={i} className={card}>
                    Item {i + 2}
                  </Grid.Item>
                ))}
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>
      </main>
    </div>
  )
}
