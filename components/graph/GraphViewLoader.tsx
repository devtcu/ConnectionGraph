"use client";

import dynamic from "next/dynamic";

// Sigma touches WebGL APIs that don't exist during server-side prerendering,
// so the graph view must only ever mount in the browser. `ssr: false` is
// only valid inside a Client Component, hence this thin wrapper.
const GraphView = dynamic(() => import("@/components/graph/GraphView"), {
  ssr: false,
});

export default function GraphViewLoader() {
  return <GraphView />;
}
