"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import type { JobInputMode, JobProfile } from "@/lib/jobs/types";
import JobProfilePreview from "@/components/jobs/JobProfilePreview";

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
    <div style={containerStyle}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Add a job</h1>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
        Paste a job posting URL or the job description text to build a structured profile.
      </p>

      <div style={toggleRowStyle}>
        <button
          type="button"
          onClick={() => setMode("url")}
          style={mode === "url" ? toggleButtonActiveStyle : toggleButtonStyle}
        >
          Job URL
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          style={mode === "text" ? toggleButtonActiveStyle : toggleButtonStyle}
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
            style={inputStyle}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={10}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        )}

        <button type="submit" disabled={loading || value.trim().length === 0} style={submitButtonStyle}>
          {loading ? "Parsing..." : "Parse job"}
        </button>
      </form>

      {error && (
        <div style={errorBoxStyle}>
          <strong style={{ display: "block", fontSize: 12, marginBottom: 2 }}>{error.code}</strong>
          {error.message}
        </div>
      )}

      {jobProfile && <JobProfilePreview jobProfile={jobProfile} />}
    </div>
  );
}

const containerStyle: CSSProperties = {
  maxWidth: 560,
  margin: "40px auto",
  padding: "0 20px",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const toggleRowStyle: CSSProperties = { display: "flex", gap: 8, marginBottom: 16 };

const toggleButtonStyle: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#334155",
  fontSize: 13,
  cursor: "pointer",
};

const toggleButtonActiveStyle: CSSProperties = {
  ...toggleButtonStyle,
  background: "#0f172a",
  border: "1px solid #0f172a",
  color: "#fff",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  color: "#0f172a",
  boxSizing: "border-box",
};

const submitButtonStyle: CSSProperties = {
  marginTop: 12,
  padding: "10px 18px",
  borderRadius: 8,
  border: "none",
  background: "#f97316",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const errorBoxStyle: CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 8,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  fontSize: 13,
};
