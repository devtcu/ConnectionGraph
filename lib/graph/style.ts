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
  person: "#22c55e", // green - the payoff: people to reach out to
};

// job > company > everything else, by a clear margin, so the target job and
// its employer read as dominant even once people are sized up by relevance.
const BASE_SIZES: Record<GraphNode["type"], number> = {
  job: 26,
  company: 18,
  role: 9,
  person: 7,
};

const PERSON_MAX_SIZE_BOOST = 9; // person size range: 7-16, always below company's 18

/**
 * People are the point of this graph, so their visual weight is driven by
 * their computed relevance score (from lib/scoring) rather than a flat
 * per-type size/color: the most reach-out-worthy people should visually
 * pop, everything else recedes.
 */
export function getNodeStyle(node: GraphNode, personTotalScore?: number): NodeVisualStyle {
  if (node.type === "person") {
    const t = personTotalScore ?? 0;
    return {
      color: interpolateColor("#bbf7d0", "#15803d", t),
      size: BASE_SIZES.person + t * PERSON_MAX_SIZE_BOOST,
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
export function applyNodeStyles(graph: Graph, personTotalScores: Map<string, number>): void {
  graph.forEachNode((nodeKey, attrs) => {
    const node = attrs.data as GraphNode;
    const style = getNodeStyle(node, personTotalScores.get(nodeKey));
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

function parseColor(color: string): { r: number; g: number; b: number } {
  if (color.startsWith("#")) return hexToRgb(color);
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
  return { r: 148, g: 163, b: 184 }; // slate-400 fallback
}

/**
 * Blends a node/edge color toward a neutral gray, used to visually "fade"
 * whatever isn't connected to the currently hovered/selected node.
 */
export function fadeColor(color: string, amount = 0.85): string {
  const from = parseColor(color);
  const to = { r: 226, g: 232, b: 240 }; // slate-200, close to the page background
  const r = Math.round(from.r + (to.r - from.r) * amount);
  const g = Math.round(from.g + (to.g - from.g) * amount);
  const b = Math.round(from.b + (to.b - from.b) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}
