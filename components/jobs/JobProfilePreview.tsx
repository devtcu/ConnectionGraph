import type { ReactNode } from "react";
import type { JobProfile } from "@/lib/jobs/types";

interface JobProfilePreviewProps {
  jobProfile: JobProfile;
}

/** Small debug/preview panel - just enough to sanity-check what the parser pulled out. Not the graph UI. */
export default function JobProfilePreview({ jobProfile }: JobProfilePreviewProps) {
  return (
    <div className="panel panel-pad" style={{ marginTop: 20, background: "#fafcfb" }}>
      <Row label="Company">{jobProfile.company ?? "—"}</Row>
      <Row label="Role">{jobProfile.title ?? "—"}</Row>
      <Row label="Location">{jobProfile.location ?? "—"}</Row>
      <Row label="Domains">
        <PillList items={jobProfile.domains} />
      </Row>
      <Row label="Required skills">
        <PillList items={jobProfile.requiredSkills} />
      </Row>
      {jobProfile.preferredSkills.length > 0 && (
        <Row label="Preferred skills">
          <PillList items={jobProfile.preferredSkills} />
        </Row>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <span className="eyebrow" style={{ display: "block", marginBottom: 4 }}>
        {label}
      </span>
      <span style={{ fontSize: 13 }}>{children}</span>
    </div>
  );
}

function PillList({ items }: { items: string[] }) {
  if (items.length === 0) return <span style={{ fontSize: 13 }}>—</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((item) => (
        <span key={item} className="pill">
          {item}
        </span>
      ))}
    </div>
  );
}
