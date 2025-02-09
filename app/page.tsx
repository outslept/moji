import { Grid, GridCell } from "../components/grid";

export default function Home() {
  return (
    <div className="w-full p-8 bg-background">
      <Grid columns={3} rows={2}>
        <GridCell solid>1</GridCell>
        <GridCell solid>2</GridCell>
        <GridCell solid>3</GridCell>
        <GridCell solid>4</GridCell>
        <GridCell solid>5</GridCell>
        <GridCell solid>6</GridCell>
      </Grid>
    </div>
  );
}
