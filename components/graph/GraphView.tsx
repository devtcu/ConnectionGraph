"use client";

import { useEffect, useRef, useState } from "react";
import Sigma from "sigma";
import { buildGraph } from "@/lib/graph/buildGraph";
import { applyLayout } from "@/lib/graph/layout";
import { applyNodeStyles, fadeColor } from "@/lib/graph/style";
import { sampleCareerGraph } from "@/lib/fixtures/sampleCareerGraph";
import { rankPeopleForJob } from "@/lib/scoring/scorePersonForJob";
import type { PersonRelevanceScore } from "@/lib/scoring/types";
import type { GraphNode } from "@/lib/graph/types";
import NodeDetailPanel from "@/components/graph/NodeDetailPanel";

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedScore, setSelectedScore] = useState<PersonRelevanceScore | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = buildGraph(sampleCareerGraph);
    applyLayout(graph);

    const scores = rankPeopleForJob(graph, sampleCareerGraph.job.id);
    const scoresByPersonId = new Map(scores.map((s) => [s.personId, s]));
    const totalScoresByPersonId = new Map(scores.map((s) => [s.personId, s.totalScore]));
    applyNodeStyles(graph, totalScoresByPersonId);

    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      labelRenderedSizeThreshold: 6,
      minCameraRatio: 0.1,
      maxCameraRatio: 8,
    });

    // Hover takes priority over selection; when the cursor leaves a node,
    // focus falls back to whatever is selected (or nothing). Plain mutable
    // vars (not React state) because reducers run on every render frame and
    // must read the latest value synchronously - re-rendering React on every
    // mouse move would be wasteful, so we call sigma.refresh() directly
    // instead.
    let hoveredNodeId: string | null = null;
    let selectedNodeId: string | null = null;
    const currentFocus = () => hoveredNodeId ?? selectedNodeId;

    sigma.setSetting("nodeReducer", (node, data) => {
      const focus = currentFocus();
      if (!focus) return data;
      if (node === focus || graph.areNeighbors(focus, node)) {
        return { ...data, forceLabel: true, zIndex: 1 };
      }
      return { ...data, color: fadeColor(data.color), label: null, zIndex: 0 };
    });

    sigma.setSetting("edgeReducer", (edge, data) => {
      const focus = currentFocus();
      if (!focus) return data;
      const [source, target] = graph.extremities(edge);
      if (source === focus || target === focus) {
        return { ...data, color: "#475569", size: 2, zIndex: 1 };
      }
      return { ...data, hidden: true };
    });

    sigma.on("enterNode", ({ node }) => {
      hoveredNodeId = node;
      sigma.refresh({ skipIndexation: true });
      if (containerRef.current) containerRef.current.style.cursor = "pointer";
    });

    sigma.on("leaveNode", () => {
      hoveredNodeId = null;
      sigma.refresh({ skipIndexation: true });
      if (containerRef.current) containerRef.current.style.cursor = "default";
    });

    sigma.on("clickNode", ({ node }) => {
      selectedNodeId = node;
      const attrs = graph.getNodeAttributes(node);
      setSelectedNode(attrs.data as GraphNode);
      setSelectedScore(scoresByPersonId.get(node) ?? null);
      sigma.refresh({ skipIndexation: true });
    });

    sigma.on("clickStage", () => {
      selectedNodeId = null;
      setSelectedNode(null);
      setSelectedScore(null);
      sigma.refresh({ skipIndexation: true });
    });

    return () => {
      sigma.kill();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <NodeDetailPanel
        node={selectedNode}
        score={selectedScore}
        onClose={() => {
          setSelectedNode(null);
          setSelectedScore(null);
        }}
      />
    </div>
  );
}
