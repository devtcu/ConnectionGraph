"use client";

import { useState, type CSSProperties } from "react";
import type { JobProfile } from "@/lib/jobs/types";
import type { DiscoveredPerson } from "@/lib/people/types";

interface PersonDiscoveryPanelProps {
  jobProfile: JobProfile;
}

interface DiscoverErrorResponse {
  error: { code: string; message: string };
}

interface DiscoverSuccessResponse {
  people: DiscoveredPerson[];
}

export default function PersonDiscoveryPanel({ jobProfile }: PersonDiscoveryPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [people, setPeople] = useState<DiscoveredPerson[] | null>(null);

  async function handleFindPeople() {
    setLoading(true);
    setError(null);
    setPeople(null);

    try {
      const res = await fetch("/api/people/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobProfile }),
      });
      const body = (await res.json()) as DiscoverSuccessResponse | DiscoverErrorResponse;

      if (!res.ok || "error" in body) {
        setError((body as DiscoverErrorResponse).error);
        return;
      }
      setPeople(body.people);
    } catch {
      setError({ code: "NETWORK_ERROR", message: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <button onClick={handleFindPeople} disabled={loading} style={buttonStyle}>
        {loading ? "Searching the web..." : "Find people"}
      </button>

      {error && (
        <div style={errorBoxStyle}>
          <strong style={{ display: "block", fontSize: 12, marginBottom: 2 }}>{error.code}</strong>
          {error.message}
        </div>
      )}

      {people && people.length === 0 && (
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 12 }}>
          No people with a citable public source were found for this posting.
        </p>
      )}

      {people && people.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={disclaimerStyle}>
            AI-suggested, unverified — synthesized from public web search results. Confirm before relying on this.
          </div>
          {people.map((person) => (
            <div key={`${person.name}-${person.sourceUrls[0]}`} style={personCardStyle}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{person.name}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                {[person.title, person.companyName].filter(Boolean).join(" · ") || "—"}
              </div>
              {person.relationToRole && (
                <p style={{ fontSize: 13, color: "#334155", marginTop: 6 }}>{person.relationToRole}</p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div style={confidenceTrackStyle}>
                  <div style={{ ...confidenceFillStyle, width: `${Math.round(person.confidence * 100)}%` }} />
                </div>
                <span style={{ fontSize: 12, color: "#64748b" }}>{Math.round(person.confidence * 100)}% confidence</span>
              </div>
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {person.sourceUrls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" style={sourceLinkStyle}>
                    source
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const containerStyle: CSSProperties = { marginTop: 20 };

const buttonStyle: CSSProperties = {
  padding: "10px 18px",
  borderRadius: 8,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const errorBoxStyle: CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 8,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  fontSize: 13,
};

const disclaimerStyle: CSSProperties = {
  fontSize: 12,
  color: "#92400e",
  background: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: 8,
  padding: "8px 12px",
  marginBottom: 10,
};

const personCardStyle: CSSProperties = {
  padding: 12,
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  marginBottom: 8,
  background: "#fff",
};

const confidenceTrackStyle: CSSProperties = {
  flex: 1,
  height: 6,
  background: "#e2e8f0",
  borderRadius: 999,
  overflow: "hidden",
};

const confidenceFillStyle: CSSProperties = {
  height: "100%",
  background: "#0f172a",
  borderRadius: 999,
};

const sourceLinkStyle: CSSProperties = {
  fontSize: 12,
  color: "#2563eb",
  textDecoration: "underline",
};
