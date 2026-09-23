"use client";

import { useEffect, useRef, useState } from "react";
import Sigma from "sigma";
import { buildGraph } from "@/lib/graph/buildGraph";
import { applyLayout } from "@/lib/graph/layout";
import { applyNodeStyles } from "@/lib/graph/style";
import { sampleCareerGraph } from "@/lib/fixtures/sampleCareerGraph";
import type { GraphNode } from "@/lib/graph/types";
import NodeDetailPanel from "@/components/graph/NodeDetailPanel";

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = buildGraph(sampleCareerGraph);
    applyLayout(graph);
    applyNodeStyles(graph);

    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      labelRenderedSizeThreshold: 6,
    });
    sigmaRef.current = sigma;

    sigma.on("clickNode", ({ node }) => {
      const attrs = graph.getNodeAttributes(node);
      setSelectedNode(attrs.data as GraphNode);
    });

    sigma.on("clickStage", () => {
      setSelectedNode(null);
    });

    return () => {
      sigma.kill();
      sigmaRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
