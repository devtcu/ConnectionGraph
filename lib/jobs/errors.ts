export type JobIngestionErrorCode =
  | "INVALID_URL"
  | "URL_UNREACHABLE"
  | "URL_BLOCKED"
  | "TEXT_TOO_SHORT"
  | "PARSE_FAILED";

export class JobIngestionError extends Error {
  code: JobIngestionErrorCode;

  constructor(code: JobIngestionErrorCode, message: string) {
    super(message);
    this.name = "JobIngestionError";
    this.code = code;
  }
}
