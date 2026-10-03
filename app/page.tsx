import GraphViewLoader from "@/components/graph/GraphViewLoader";
import { sampleCareerGraph } from "@/lib/fixtures/sampleCareerGraph";

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      <GraphViewLoader fixture={sampleCareerGraph} />
    </main>
  );
}
