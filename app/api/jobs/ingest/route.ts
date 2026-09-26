import { NextResponse } from "next/server";
import { ingestJob } from "@/lib/jobs/ingestJob";
import { JobIngestionError, type JobIngestionErrorCode } from "@/lib/jobs/errors";
import type { JobInputMode } from "@/lib/jobs/types";

const STATUS_BY_CODE: Record<JobIngestionErrorCode, number> = {
  INVALID_URL: 400,
  TEXT_TOO_SHORT: 400,
  URL_UNREACHABLE: 502,
  URL_BLOCKED: 502,
  PARSE_FAILED: 422,
  NO_SIGNAL_EXTRACTED: 422,
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_URL", message: "Request body must be JSON." } }, { status: 400 });
  }

  const { mode, value } = (body ?? {}) as { mode?: unknown; value?: unknown };
  if ((mode !== "url" && mode !== "text") || typeof value !== "string" || value.trim().length === 0) {
    return NextResponse.json(
      { error: { code: "INVALID_URL", message: 'Request must include mode ("url" | "text") and a non-empty value.' } },
      { status: 400 },
    );
  }

  try {
    const jobProfile = await ingestJob({ mode: mode as JobInputMode, value });
    return NextResponse.json({ jobProfile });
  } catch (err) {
    if (err instanceof JobIngestionError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: STATUS_BY_CODE[err.code] },
      );
    }
    console.error("Unexpected job ingestion error:", err);
    return NextResponse.json(
      { error: { code: "PARSE_FAILED", message: "Something went wrong while processing this job." } },
      { status: 500 },
    );
  }
}
