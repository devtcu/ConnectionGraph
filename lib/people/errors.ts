export type PersonDiscoveryErrorCode = "NOT_CONFIGURED" | "SEARCH_FAILED";

export class PersonDiscoveryError extends Error {
  code: PersonDiscoveryErrorCode;

  constructor(code: PersonDiscoveryErrorCode, message: string) {
    super(message);
    this.name = "PersonDiscoveryError";
    this.code = code;
  }
}
