import type { JobInputMode } from "@/lib/jobs/types";
import type { JobProfile } from "@/lib/jobs/types";
import type { JobContentProvider } from "@/lib/jobs/content/JobContentProvider";
import { TextJobContentProvider } from "@/lib/jobs/content/TextJobContentProvider";
import { UrlJobContentProvider } from "@/lib/jobs/content/UrlJobContentProvider";
import { getJobTextParser } from "@/lib/jobs/parse/getJobTextParser";

function getContentProvider(mode: JobInputMode): JobContentProvider {
  return mode === "url" ? new UrlJobContentProvider() : new TextJobContentProvider();
}

/**
 * The whole pipeline: input -> content provider -> clean text -> parser -> JobProfile.
 * Both input modes converge here on the same output type.
 */
export async function ingestJob(input: { mode: JobInputMode; value: string }): Promise<JobProfile> {
  const contentProvider = getContentProvider(input.mode);
  const { text, sourceUrl } = await contentProvider.getContent(input.value);

  const parser = getJobTextParser();
  return parser.parse(text, sourceUrl);
}
