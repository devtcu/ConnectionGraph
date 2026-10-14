"use client";

import { useState, type FormEvent } from "react";
import type { JobInputMode, JobProfile } from "@/lib/jobs/types";
import JobProfilePreview from "@/components/jobs/JobProfilePreview";
import PersonDiscoveryPanel from "@/components/jobs/PersonDiscoveryPanel";

interface IngestErrorResponse {
  error: { code: string; message: string };
}

interface IngestSuccessResponse {
  jobProfile: JobProfile;
}

export default function JobIntakeForm() {
  const [mode, setMode] = useState<JobInputMode>("text");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setJobProfile(null);

    try {
      const res = await fetch("/api/jobs/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, value }),
      });
      const body = (await res.json()) as IngestSuccessResponse | IngestErrorResponse;

      if (!res.ok || "error" in body) {
        const errBody = body as IngestErrorResponse;
        setError(errBody.error);
        return;
      }
      setJobProfile(body.jobProfile);
    } catch {
      setError({ code: "NETWORK_ERROR", message: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px 60px" }}>
      <div className="page-heading" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 650, letterSpacing: "-0.5px" }}>Add a job</h1>
        <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
          Paste a job posting URL or the job description text to build a structured profile.
        </p>
      </div>

      <div className="btn-group" style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`btn ${mode === "url" ? "btn-dark" : "btn-secondary"}`}
        >
          Job URL
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`btn ${mode === "text" ? "btn-dark" : "btn-secondary"}`}
        >
          Job description
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === "url" ? (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://company.com/careers/senior-ml-engineer"
            className="field-input"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={10}
            className="field-textarea"
          />
        )}

        <button
          type="submit"
          disabled={loading || value.trim().length === 0}
          className="btn btn-primary"
          style={{ marginTop: 12 }}
        >
          {loading ? "Parsing..." : "Parse job"}
        </button>
      </form>

      {error && (
        <div className="notice notice-error" style={{ marginTop: 16 }}>
          <strong>{error.code}</strong>
          {error.message}
        </div>
      )}

      {jobProfile && (
        <>
          <JobProfilePreview jobProfile={jobProfile} />
          <PersonDiscoveryPanel jobProfile={jobProfile} />
        </>
      )}
    </div>
  );
}
