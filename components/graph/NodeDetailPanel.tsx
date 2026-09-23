import type { CSSProperties } from "react";
import type { GraphNode } from "@/lib/graph/types";
import { sampleCareerGraph } from "@/lib/fixtures/sampleCareerGraph";

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

const TYPE_LABEL: Record<GraphNode["type"], string> = {
  job: "Target job",
  company: "Company",
  role: "Role",
  skill: "Skill",
  person: "Person",
};

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) {
    return (
      <div style={panelStyle}>
        <p style={{ color: "#64748b", fontSize: 13 }}>
          Click a node to see details. Green nodes are people — brighter and
          larger means more relevant to reach out to for this role.
        </p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <button onClick={onClose} style={closeButtonStyle} aria-label="Close">
        ×
      </button>
      <span style={badgeStyle}>{TYPE_LABEL[node.type]}</span>
      {node.type === "person" ? <PersonDetails node={node} /> : <GenericDetails node={node} />}
    </div>
  );
}

function PersonDetails({ node }: { node: Extract<GraphNode, { type: "person" }> }) {
  const role = sampleCareerGraph.roles.find((r) => r.id === node.currentRole);
  const company =
    sampleCareerGraph.company.id === node.companyId
      ? sampleCareerGraph.company
      : sampleCareerGraph.otherCompanies.find((c) => c.id === node.companyId);
  const skills = sampleCareerGraph.skills.filter((s) => node.skills.includes(s.id));

  return (
    <div>
      <h3 style={titleStyle}>{node.name}</h3>
      <p style={subtitleStyle}>{node.title}</p>
      <p style={subtitleStyle}>{company?.name}</p>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
          Outreach relevance
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={scoreBarTrackStyle}>
            <div
              style={{
                ...scoreBarFillStyle,
                width: `${Math.round(node.relevanceScore * 100)}%`,
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {Math.round(node.relevanceScore * 100)}%
          </span>
        </div>
      </div>

      {role && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Role</div>
          <span style={pillStyle}>{role.name}</span>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Skills</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {skills.map((s) => (
            <span key={s.id} style={pillStyle}>
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenericDetails({ node }: { node: GraphNode }) {
  const label =
    node.type === "job"
      ? node.title
      : node.type === "company"
      ? node.name
      : node.type === "role"
      ? node.name
      : node.name;

  return (
    <div>
      <h3 style={titleStyle}>{label}</h3>
      {node.type === "job" && (
        <>
          <p style={subtitleStyle}>{node.seniority}</p>
          <p style={{ fontSize: 13, color: "#334155", marginTop: 10, lineHeight: 1.5 }}>
            {node.rawText}
          </p>
        </>
      )}
    </div>
  );
}

const panelStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 280,
  maxHeight: "calc(100% - 32px)",
  overflowY: "auto",
  background: "rgba(255, 255, 255, 0.97)",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const closeButtonStyle: CSSProperties = {
  position: "absolute",
  top: 8,
  right: 10,
  border: "none",
  background: "transparent",
  fontSize: 18,
  lineHeight: 1,
  cursor: "pointer",
  color: "#94a3b8",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  color: "#6366f1",
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#0f172a",
  margin: 0,
};

const subtitleStyle: CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  margin: "2px 0 0 0",
};

const pillStyle: CSSProperties = {
  fontSize: 12,
  background: "#f1f5f9",
  color: "#334155",
  borderRadius: 999,
  padding: "3px 10px",
  display: "inline-block",
};

const scoreBarTrackStyle: CSSProperties = {
  flex: 1,
  height: 6,
  background: "#e2e8f0",
  borderRadius: 999,
  overflow: "hidden",
};

const scoreBarFillStyle: CSSProperties = {
  height: "100%",
  background: "#22c55e",
  borderRadius: 999,
};
