import type { CSSProperties } from "react";
import type { JobProfile } from "@/lib/jobs/types";

interface JobProfilePreviewProps {
  jobProfile: JobProfile;
}

/** Small debug/preview panel - just enough to sanity-check what the parser pulled out. Not the graph UI. */
export default function JobProfilePreview({ jobProfile }: JobProfilePreviewProps) {
  return (
    <div style={panelStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>Company</span>
        <span style={valueStyle}>{jobProfile.company ?? "—"}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Role</span>
        <span style={valueStyle}>{jobProfile.title ?? "—"}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Location</span>
        <span style={valueStyle}>{jobProfile.location ?? "—"}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Domains</span>
        <div style={pillRowStyle}>
          {jobProfile.domains.length > 0
            ? jobProfile.domains.map((d) => (
                <span key={d} style={pillStyle}>
                  {d}
                </span>
              ))
            : "—"}
        </div>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Required skills</span>
        <div style={pillRowStyle}>
          {jobProfile.requiredSkills.length > 0
            ? jobProfile.requiredSkills.map((s) => (
                <span key={s} style={pillStyle}>
                  {s}
                </span>
              ))
            : "—"}
        </div>
      </div>
      {jobProfile.preferredSkills.length > 0 && (
        <div style={rowStyle}>
          <span style={labelStyle}>Preferred skills</span>
          <div style={pillRowStyle}>
            {jobProfile.preferredSkills.map((s) => (
              <span key={s} style={pillStyle}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const panelStyle: CSSProperties = {
  marginTop: 20,
  padding: 16,
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "#f8fafc",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const rowStyle: CSSProperties = { marginBottom: 12 };

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  color: "#64748b",
  marginBottom: 4,
};

const valueStyle: CSSProperties = { fontSize: 14, color: "#0f172a" };

const pillRowStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6 };

const pillStyle: CSSProperties = {
  fontSize: 12,
  background: "#e2e8f0",
  color: "#334155",
  borderRadius: 999,
  padding: "3px 10px",
  display: "inline-block",
};
