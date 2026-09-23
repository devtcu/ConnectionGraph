import Graph from "graphology";
import type { CareerGraphFixture, GraphNode } from "@/lib/graph/types";

/**
 * Pure transform: fixture data (or, later, LLM-parsed / API-sourced data of
 * the same shape) -> a Graphology instance. Nothing here knows about
 * rendering, layout, or React.
 */
export function buildGraph(fixture: CareerGraphFixture): Graph {
  const graph = new Graph({ multi: false, type: "directed" });

  const addNode = (node: GraphNode) => {
    if (!graph.hasNode(node.id)) {
      // Nested under `data`, not spread flat: Sigma reserves its own
      // top-level `type` attribute to pick a node's rendering program, and
      // our domain `type` ("job" | "company" | ...) would collide with it.
      graph.addNode(node.id, { data: node });
    }
  };

  addNode(fixture.job);
  addNode(fixture.company);
  fixture.roles.forEach(addNode);
  fixture.people.forEach(addNode);

  for (const edge of fixture.edges) {
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) {
      continue;
    }
    if (!graph.hasEdge(edge.id)) {
      graph.addEdgeWithKey(edge.id, edge.source, edge.target, { kind: edge.kind });
    }
  }

  return graph;
}
