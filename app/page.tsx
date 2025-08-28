'use client'

import { useState } from 'react'
import { Grid } from '../components/grid'

export default function GridExamplesPage() {
  const [debugMode, setDebugMode] = useState(false)
  const [currentSpacing, setCurrentSpacing] = useState<'none' | 'tight' | 'standard' | 'relaxed' | 'wide'>('standard')

  return (
    <div className="grid-examples-page">
      {/* Header */}
      <header className="page-header">
        <div className="container">
          {/* Controls */}
          <div className="controls">
            <label>
              <input
                type="checkbox"
                checked={debugMode}
                onChange={e => setDebugMode(e.target.checked)}
              />
              Debug Mode
            </label>

            <label>
              Spacing:
              <select
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
      </header>

      <main className="examples-content">
        {/* Basic Grid */}
        <section className="example-section">
          <div className="container">
            <h2>Basic Grid</h2>

            <Grid.Root debug={debugMode} spacing={currentSpacing}>
              <Grid.Container columns={3}>
                <Grid.Item className="demo-item">Item 1</Grid.Item>
                <Grid.Item className="demo-item">Item 2</Grid.Item>
                <Grid.Item className="demo-item">Item 3</Grid.Item>
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        {/* Responsive Grid */}
        <section className="example-section">
          <div className="container">
            <h2>Responsive Grid</h2>

            <Grid.Root debug={debugMode} spacing={currentSpacing}>
              <Grid.Container columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <Grid.Item key={i} className="demo-item">
                    Card
                    {' '}
                    {i + 1}
                  </Grid.Item>
                ))}
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        {/* Spanning Items */}
        <section className="example-section">
          <div className="container">
            <h2>Spanning Items</h2>

            <Grid.Root debug={debugMode} spacing={currentSpacing}>
              <Grid.Container columns={4}>
                <Grid.Item span={2} className="demo-item">Span 2 columns</Grid.Item>
                <Grid.Item className="demo-item">Regular</Grid.Item>
                <Grid.Item className="demo-item">Regular</Grid.Item>
                <Grid.Item span={3} className="demo-item">Span 3 columns</Grid.Item>
                <Grid.Item className="demo-item">Regular</Grid.Item>
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        {/* Auto Grid */}
        <section className="example-section">
          <div className="container">
            <h2>Auto-Fitting Grid</h2>

            <Grid.Root debug={debugMode} spacing={currentSpacing}>
              <Grid.AutoGrid minItemWidth="200px">
                {Array.from({ length: 6 }, (_, i) => (
                  <Grid.Item key={i} className="demo-item">
                    Auto Item
                    {' '}
                    {i + 1}
                  </Grid.Item>
                ))}
              </Grid.AutoGrid>
            </Grid.Root>
          </div>
        </section>

        {/* Holy Grail Layout */}
        <section className="example-section">
          <div className="container">
            <h2>Holy Grail Layout</h2>

            <div className="layout-demo">
              <Grid.Root debug={debugMode} spacing={currentSpacing}>
                <Grid.Holy>
                  <Grid.Area name="header" className="demo-area">Header</Grid.Area>
                  <Grid.Area name="sidebar" className="demo-area">Sidebar</Grid.Area>
                  <Grid.Area name="main" className="demo-area">Main Content</Grid.Area>
                  <Grid.Area name="footer" className="demo-area">Footer</Grid.Area>
                </Grid.Holy>
              </Grid.Root>
            </div>
          </div>
        </section>

        {/* Dashboard Layout */}
        <section className="example-section">
          <div className="container">
            <h2>Dashboard Layout</h2>

            <div className="layout-demo">
              <Grid.Root debug={debugMode} spacing={currentSpacing}>
                <Grid.Dashboard>
                  <Grid.Area name="nav" className="demo-area">Navigation</Grid.Area>
                  <Grid.Area name="main" className="demo-area">
                    <Grid.Container columns={{ base: 1, md: 2, lg: 3 }}>
                      <Grid.Item className="demo-item">Metric 1</Grid.Item>
                      <Grid.Item className="demo-item">Metric 2</Grid.Item>
                      <Grid.Item className="demo-item">Metric 3</Grid.Item>
                    </Grid.Container>
                  </Grid.Area>
                </Grid.Dashboard>
              </Grid.Root>
            </div>
          </div>
        </section>

        {/* Complex Layout with Areas */}
        <section className="example-section">
          <div className="container">
            <h2>Complex Layout with Named Areas</h2>

            <div className="layout-demo">
              <Grid.Root debug={debugMode} spacing={currentSpacing}>
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
                      "hero hero"
                      "content sidebar"
                      "footer footer"
                    `,
                    lg: `
                      "header header header"
                      "hero hero sidebar"
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
                  <Grid.Area name="header" className="demo-area">Header</Grid.Area>
                  <Grid.Area name="hero" className="demo-area">Hero Section</Grid.Area>
                  <Grid.Area name="content" className="demo-area">Main Content</Grid.Area>
                  <Grid.Area name="sidebar" className="demo-area">Sidebar</Grid.Area>
                  <Grid.Area name="footer" className="demo-area">Footer</Grid.Area>
                </Grid.Container>
              </Grid.Root>
            </div>
          </div>
        </section>

        {/* Masonry Layout */}
        <section className="example-section">
          <div className="container">
            <h2>Masonry-Style Layout</h2>

            <Grid.Root debug={debugMode} spacing={currentSpacing}>
              <Grid.Masonry columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
                {[120, 180, 100, 220, 160, 140, 200, 130].map((height, i) => (
                  <Grid.Item key={i} className="demo-item" style={{ height: `${height}px` }}>
                    Item
                    {' '}
                    {i + 1}
                    {' '}
                    (
                    {height}
                    px)
                  </Grid.Item>
                ))}
              </Grid.Masonry>
            </Grid.Root>
          </div>
        </section>

        {/* Stacked Items */}
        <section className="example-section">
          <div className="container">
            <h2>Stacked Items</h2>

            <Grid.Root debug={debugMode} spacing={currentSpacing}>
              <Grid.Container columns={{ base: 1, md: 2 }}>
                <Grid.Stack className="demo-stack">
                  <div className="stack-layer background">Background Layer</div>
                  <div className="stack-layer overlay">Overlay Layer</div>
                </Grid.Stack>
                <Grid.Item className="demo-item">Regular Item</Grid.Item>
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        {/* Interactive Grid */}
        <section className="example-section">
          <div className="container">
            <h2>Interactive Grid</h2>

            <Grid.Root debug={debugMode} spacing={currentSpacing}>
              <Grid.Container columns={{ base: 2, md: 3, lg: 4 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <Grid.Item key={i} interactive className="demo-item">
                    Interactive
                    {' '}
                    {i + 1}
                  </Grid.Item>
                ))}
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        {/* Nested Grids */}
        <section className="example-section">
          <div className="container">
            <h2>Nested Grids</h2>

            <Grid.Root debug={debugMode} spacing={currentSpacing}>
              <Grid.Container columns={{ base: 1, lg: 2 }}>
                <Grid.Item className="demo-item">
                  <h3>Nested Grid Container</h3>
                  <Grid.Container columns={2} gap="tight">
                    <Grid.Item className="demo-item nested">Nested 1</Grid.Item>
                    <Grid.Item className="demo-item nested">Nested 2</Grid.Item>
                    <Grid.Item span={2} className="demo-item nested">Nested Wide</Grid.Item>
                  </Grid.Container>
                </Grid.Item>
                <Grid.Item className="demo-item">Regular Item</Grid.Item>
              </Grid.Container>
            </Grid.Root>
          </div>
        </section>

        {/* Advanced Responsive */}
        <section className="example-section">
          <div className="container">
            <h2>Advanced Responsive Patterns</h2>

            <Grid.Root debug={debugMode} spacing={currentSpacing}>
              <Grid.Container columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }}>
                <Grid.Item
                  span={{ base: 1, sm: 2, md: 1, lg: 2, xl: 2 }}
                  className="demo-item"
                >
                  Responsive Spanning
                </Grid.Item>
                {Array.from({ length: 10 }, (_, i) => (
                  <Grid.Item key={i} className="demo-item">
                    Item
                    {' '}
                    {i + 2}
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
