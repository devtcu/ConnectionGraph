import type { JobInputMode } from "@/lib/jobs/types";
import type { JobProfile } from "@/lib/jobs/types";
import type { JobContentProvider } from "@/lib/jobs/content/JobContentProvider";
import { TextJobContentProvider } from "@/lib/jobs/content/TextJobContentProvider";
import { UrlJobContentProvider } from "@/lib/jobs/content/UrlJobContentProvider";
import { getJobTextParser } from "@/lib/jobs/parse/getJobTextParser";
import { JobIngestionError } from "@/lib/jobs/errors";

function getContentProvider(mode: JobInputMode): JobContentProvider {
  return mode === "url" ? new UrlJobContentProvider() : new TextJobContentProvider();
}


function pageLikelyDidNotRender(profile: JobProfile): boolean {
  return !profile.title && !profile.company;
}

/**
 * The whole pipeline: input -> content provider -> clean text -> parser -> JobProfile.
 * Both input modes converge here on the same output type.
 */
export async function ingestJob(input: { mode: JobInputMode; value: string }): Promise<JobProfile> {
  const contentProvider = getContentProvider(input.mode);
  const { text, sourceUrl } = await contentProvider.getContent(input.value);

  const parser = getJobTextParser();
  const jobProfile = await parser.parse(text, sourceUrl);

  if (input.mode === "url" && pageLikelyDidNotRender(jobProfile)) {
    throw new JobIngestionError(
      "NO_SIGNAL_EXTRACTED",
      "This page likely renders its content with JavaScript, which server-side fetching can't see. Try pasting the job description text instead.",
    );
  }

  return jobProfile;
}
