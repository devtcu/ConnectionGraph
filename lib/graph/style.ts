import type Graph from "graphology";
import type { GraphNode } from "@/lib/graph/types";

export interface NodeVisualStyle {
  color: string;
  size: number;
}

const BASE_COLORS: Record<GraphNode["type"], string> = {
  job: "#f97316", // orange - the anchor
  company: "#6366f1", // indigo
  role: "#0ea5e9", // sky
  skill: "#94a3b8", // slate (muted - supporting context, not outreach targets)
  person: "#22c55e", // green - the payoff: people to reach out to
};

const BASE_SIZES: Record<GraphNode["type"], number> = {
  job: 18,
  company: 14,
  role: 10,
  skill: 7,
  person: 8,
};

/**
 * People are the point of this graph, so their visual weight is driven by
 * relevanceScore rather than a flat per-type size/color: the most
 * reach-out-worthy people should visually pop, everything else recedes.
 */
export function getNodeStyle(node: GraphNode): NodeVisualStyle {
  if (node.type === "person") {
    const t = node.relevanceScore; // 0-1
    return {
      color: interpolateColor("#bbf7d0", "#15803d", t),
      size: BASE_SIZES.person + t * 14, // 8 - 22
    };
  }

  return {
    color: BASE_COLORS[node.type],
    size: BASE_SIZES[node.type],
  };
}

export function getNodeLabel(node: GraphNode): string {
  switch (node.type) {
    case "job":
      return node.title;
    case "company":
      return node.name;
    case "role":
      return node.name;
    case "skill":
      return node.name;
    case "person":
      return node.name;
  }
}

function interpolateColor(fromHex: string, toHex: string, t: number): string {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  const r = Math.round(from.r + (to.r - from.r) * t);
  const g = Math.round(from.g + (to.g - from.g) * t);
  const b = Math.round(from.b + (to.b - from.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Mutates the graph in place, writing color/size/label onto every node so Sigma can read them directly. */
export function applyNodeStyles(graph: Graph): void {
  graph.forEachNode((nodeKey, attrs) => {
    const node = attrs.data as GraphNode;
    const style = getNodeStyle(node);
    graph.mergeNodeAttributes(nodeKey, {
      color: style.color,
      size: style.size,
      label: getNodeLabel(node),
    });
  });
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}
