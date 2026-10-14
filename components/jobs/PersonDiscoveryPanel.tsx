"use client";

import { useMemo, useState } from "react";
import type { JobProfile } from "@/lib/jobs/types";
import type { DiscoveredPerson } from "@/lib/people/types";
import { buildGraphFromJob } from "@/lib/graph/buildGraphFromJob";
import GraphViewLoader from "@/components/graph/GraphViewLoader";

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

  // Only rebuilds when a fresh discovery run actually changes `people` -
  // not on every render - since buildGraph+layout+scoring inside GraphView
  // is real work we don't want to redo on unrelated state changes.
  const fixture = useMemo(() => (people ? buildGraphFromJob(jobProfile, people) : null), [people, jobProfile]);

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
    <div style={{ marginTop: 20 }}>
      <button onClick={handleFindPeople} disabled={loading} className="btn btn-dark">
        {loading ? "Searching the web..." : "Find people"}
      </button>

      {error && (
        <div className="notice notice-error" style={{ marginTop: 12 }}>
          <strong>{error.code}</strong>
          {error.message}
        </div>
      )}

      {people && people.length === 0 && (
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
          No people with a citable public source were found for this posting.
        </p>
      )}

      {people && people.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="notice notice-warn" style={{ marginBottom: 10 }}>
            AI-suggested, unverified — synthesized from public web search results. Confirm before relying on this.
          </div>
          {people.map((person) => (
            <div key={`${person.name}-${person.sourceUrls[0]}`} className="panel panel-pad" style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{person.name}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {[person.title, person.companyName].filter(Boolean).join(" · ") || "—"}
              </div>
              {person.relationToRole && (
                <p style={{ fontSize: 13, color: "#334155", marginTop: 6 }}>{person.relationToRole}</p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div className="score-track">
                  <div className="score-fill" style={{ width: `${Math.round(person.confidence * 100)}%`, background: "#0f172a" }} />
                </div>
                <span className="muted" style={{ fontSize: 12 }}>
                  {Math.round(person.confidence * 100)}% confidence
                </span>
              </div>
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {person.sourceUrls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#147966" }}>
                    source
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {fixture && (
        <div style={{ marginTop: 20 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
            Network around this role — sized and colored by deterministic relevance, not the confidence above.
          </div>
          <div className="panel" style={{ height: 600, overflow: "hidden" }}>
            <GraphViewLoader fixture={fixture} />
          </div>
        </div>
      )}
    </div>
  );
}
