import { JobIngestionError } from "@/lib/jobs/errors";
import type { JobContentProvider, JobContentResult } from "@/lib/jobs/content/JobContentProvider";

const MIN_TEXT_LENGTH = 50;

export class TextJobContentProvider implements JobContentProvider {
  async getContent(input: string): Promise<JobContentResult> {
    const text = input.trim();
    if (text.length < MIN_TEXT_LENGTH) {
      throw new JobIngestionError(
        "TEXT_TOO_SHORT",
        `Job description is too short to parse (${text.length} characters, need at least ${MIN_TEXT_LENGTH}).`,
      );
    }
    return { text, sourceUrl: null };
  }
}
