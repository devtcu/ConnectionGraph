import GraphViewLoader from "@/components/graph/GraphViewLoader";
import { sampleCareerGraph } from "@/lib/fixtures/sampleCareerGraph";

export default function Home() {
  return (
    <main style={{ height: "100%" }}>
      <GraphViewLoader fixture={sampleCareerGraph} />
    </main>
  );
}
