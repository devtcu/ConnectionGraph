import type Graph from "graphology";
import circular from "graphology-layout/circular";
import forceAtlas2 from "graphology-layout-forceatlas2";

/**
 * Computes and writes x/y positions onto every node, once, on load. Sigma
 * only ever reads whatever x/y it finds - it does not run its own physics.
 * A circular seed avoids the NaN-position issue FA2 has with all-zero
 * starting coordinates, then FA2 settles nodes by graph structure so that
 * people who share more skills/role/company with each other and with the
 * job end up visually closer together.
 */
export function applyLayout(graph: Graph): void {
  circular.assign(graph);

  const settings = forceAtlas2.inferSettings(graph);
  forceAtlas2.assign(graph, {
    iterations: 150,
    settings: {
      ...settings,
      gravity: 1,
      scalingRatio: 10,
    },
  });
}
