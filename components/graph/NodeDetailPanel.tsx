import type { CSSProperties } from "react";
import type { GraphNode, RoleNode } from "@/lib/graph/types";
import type { PersonRelevanceScore } from "@/lib/scoring/types";
import { getStrongestConnectionLabel } from "@/lib/scoring/scorePersonForJob";

interface NodeDetailPanelProps {
  node: GraphNode | null;
  score: PersonRelevanceScore | null;
  roles: RoleNode[];
  onClose: () => void;
}

const TYPE_LABEL: Record<GraphNode["type"], string> = {
  job: "Target job",
  company: "Company",
  role: "Role",
  person: "Person",
};

export default function NodeDetailPanel({ node, score, roles, onClose }: NodeDetailPanelProps) {
  if (!node) {
    return (
      <div className="panel panel-pad" style={panelPositionStyle}>
        <p className="muted" style={{ fontSize: 13 }}>
          Click a node to see details. Green nodes are people — brighter and
          larger means more relevant to reach out to for this role.
        </p>
      </div>
    );
  }

  return (
    <div className="panel panel-pad" style={panelPositionStyle}>
      <button onClick={onClose} style={closeButtonStyle} aria-label="Close">
        ×
      </button>
      <span className="eyebrow" style={{ color: "#147966", display: "block", marginBottom: 8 }}>
        {TYPE_LABEL[node.type]}
      </span>
      {node.type === "person" ? (
        <PersonDetails node={node} score={score} roles={roles} />
      ) : (
        <GenericDetails node={node} />
      )}
    </div>
  );
}

function PersonDetails({
  node,
  score,
  roles,
}: {
  node: Extract<GraphNode, { type: "person" }>;
  score: PersonRelevanceScore | null;
  roles: RoleNode[];
}) {
  const role = roles.find((r) => r.id === node.currentRole);

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{node.name}</h3>
      <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
        {node.title}
      </p>
      <p className="muted" style={{ fontSize: 13 }}>
        {node.companyName}
      </p>

      {score && (
        <>
          <div style={{ marginTop: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>
              Outreach relevance
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="score-track">
                <div
                  className="score-fill"
                  style={{ background: "#147966", width: `${Math.round(score.totalScore * 100)}%` }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{Math.round(score.totalScore * 100)}%</span>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>
              Strongest connection
            </div>
            <span className="pill">{getStrongestConnectionLabel(score)}</span>
          </div>

          {score.reasons.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>
                Why they rank here
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                {score.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {role && (
        <div style={{ marginTop: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Role
          </div>
          <span className="pill">{role.name}</span>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>
          Domain
        </div>
        <span className="pill">{node.domain}</span>
      </div>

      {node.skills.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Skills
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {node.skills.map((skill) => (
              <span key={skill} className="pill">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
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
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{label}</h3>
      {node.type === "job" && (
        <>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
            {node.seniority}
          </p>
          <p style={{ fontSize: 13, color: "#334155", marginTop: 10, lineHeight: 1.5 }}>{node.rawText}</p>
        </>
      )}
    </div>
  );
}

const panelPositionStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 280,
  maxHeight: "calc(100% - 32px)",
  overflowY: "auto",
  background: "rgba(255, 255, 255, 0.97)",
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
