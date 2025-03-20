'use client'

import { Grid } from '../components/grid'

export default function DemoGrid() {
  return (
    <div className="demo-container">
      <Grid.CSSVariables />

      <section className="demo-section">
        <h2>Basic Grid</h2>

        <Grid.Root debug>
          <Grid.Container
            columns={12}
            gap={16}
          >
            <Grid.Item column="1 / 7" row={1}>
              <div className="demo-content">Column 1-6, Row 1</div>
            </Grid.Item>

            <Grid.Item column="7 / 13" row={1}>
              <div className="demo-content">Column 7-12, Row 1</div>
            </Grid.Item>

            <Grid.Item column="1 / 5" row={2}>
              <div className="demo-content">Column 1-4, Row 2</div>
            </Grid.Item>

            <Grid.Item column="5 / 9" row={2}>
              <div className="demo-content">Column 5-8, Row 2</div>
            </Grid.Item>

            <Grid.Item column="9 / 13" row={2}>
              <div className="demo-content">Column 9-12, Row 2</div>
            </Grid.Item>
          </Grid.Container>
        </Grid.Root>

        <h2>Responsive Grid</h2>

        <Grid.Root>
          <Grid.Container
            columns={{
              base: 2,
              sm: 4,
              md: 6,
              lg: 12,
            }}
            gap={{
              base: 8,
              md: 16,
            }}
            style={{ minHeight: '400px' }}
          >
            <Grid.Item
              column={{
                base: '1 / 3', // On XS should take full width (2 columns)
                sm: '1 / 3', // On SM should take 2 of 4 columns
                md: '1 / 4', // On MD should take 3 of 6 columns
                lg: '1 / 7', // On LG should take 6 of 12 columns
              }}
            >
              <div className="demo-content">Responsive Cell A</div>
            </Grid.Item>

            <Grid.Item
              column={{
                base: '1 / 3', // On XS should take full width (2 columns)
                sm: '3 / 5', // On SM should take 2 of 4 columns
                md: '4 / 7', // On MD should take 3 of 6 columns
                lg: '7 / 13', // On LG should take 6 of 12 columns
              }}
            >
              <div className="demo-content">Responsive Cell B</div>
            </Grid.Item>

            <Grid.Item
              column={{
                base: '1 / 2', // On XS should take 1 of 2 columns
                sm: '1 / 3', // On SM should take 2 of 4 columns
                md: '1 / 3', // On MD should take 2 of 6 columns
                lg: '1 / 5', // On LG should take 4 of 12 columns
              }}
            >
              <div className="demo-content">Responsive Cell C</div>
            </Grid.Item>

            <Grid.Item
              column={{
                base: '2 / 3', // On XS should take 1 of 2 columns
                sm: '3 / 5', // On SM should take 2 of 4 columns
                md: '3 / 5', // On MD should take 2 of 6 columns
                lg: '5 / 9', // On LG should take 4 of 12 columns
              }}
            >
              <div className="demo-content">Responsive Cell D</div>
            </Grid.Item>

            <Grid.Item
              column={{
                base: '1 / 3', // On XS should take full width (2 columns)
                sm: '1 / 5', // On SM should take full width (4 columns)
                md: '5 / 7', // On MD should take 2 of 6 columns
                lg: '9 / 13', // On LG should take 4 of 12 columns
              }}
            >
              <div className="demo-content">Responsive Cell E</div>
            </Grid.Item>
          </Grid.Container>
        </Grid.Root>

        <h2>Auto Placement</h2>

        <Grid.Root>
          <Grid.Container
            columns="repeat(auto-fill, minmax(200px, 1fr))"
            gap={16}
            autoRows="minmax(100px, auto)"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(index => (
              <Grid.Item key={index}>
                <div className="demo-content">
                  Card
                  {' '}
                  {index}
                </div>
              </Grid.Item>
            ))}
          </Grid.Container>
        </Grid.Root>

        <h2>Named Areas</h2>

        <Grid.Root>
          <Grid.Container
            columns="1fr 3fr 1fr"
            rows="auto 1fr auto"
            areas={`
              "header header header"
              "nav    main   aside"
              "footer footer footer"
            `}
            gap={8}
            style={{ minHeight: '400px' }}
          >
            <Grid.Area name="header">
              <div className="demo-content">Header</div>
            </Grid.Area>

            <Grid.Area name="nav">
              <div className="demo-content">Navigation</div>
            </Grid.Area>

            <Grid.Area name="main">
              <div className="demo-content">Main Content</div>
            </Grid.Area>

            <Grid.Area name="aside">
              <div className="demo-content">Sidebar</div>
            </Grid.Area>

            <Grid.Area name="footer">
              <div className="demo-content">Footer</div>
            </Grid.Area>
          </Grid.Container>
        </Grid.Root>

        <h2>Stacked Items</h2>

        <Grid.Root>
          <Grid.Container columns={3} gap={16} style={{ minHeight: '200px' }}>
            <Grid.Item column={1}>
              <div className="demo-content">Regular Item</div>
            </Grid.Item>

            <Grid.Stack column={2}>
              <div className="demo-content" style={{ backgroundColor: 'rgba(255, 100, 100, 0.7)' }}>
                Stacked Item 1
              </div>
              <div className="demo-content" style={{ backgroundColor: 'rgba(100, 255, 100, 0.7)' }}>
                Stacked Item 2
              </div>
            </Grid.Stack>

            <Grid.Item column={3}>
              <div className="demo-content">Regular Item</div>
            </Grid.Item>
          </Grid.Container>
        </Grid.Root>
      </section>

      <style jsx>
        {`
        .demo-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .demo-section {
          margin-bottom: 40px;
        }

        .demo-content {
          padding: 16px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        h2 {
          margin-top: 40px;
          margin-bottom: 16px;
        }
      `}
      </style>
    </div>
  )
}
