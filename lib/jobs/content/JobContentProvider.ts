export interface JobContentResult {
  text: string;
  sourceUrl: string | null;
}

/**
 * Turns whatever the user gave us (a URL or pasted text) into clean text
 * ready for parsing. Both implementations converge on this one interface
 * so the parser downstream never needs to know which path the text came
 * from.
 */
export interface JobContentProvider {
  getContent(input: string): Promise<JobContentResult>;
}
