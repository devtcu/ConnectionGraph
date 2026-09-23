import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { JobIngestionError } from "@/lib/jobs/errors";
import type { JobContentProvider, JobContentResult } from "@/lib/jobs/content/JobContentProvider";

const FETCH_TIMEOUT_MS = 10_000;
const MIN_EXTRACTED_TEXT_LENGTH = 200; // below this, it's almost certainly a JS-rendered shell, not real content

function assertValidUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new JobIngestionError("INVALID_URL", `"${input}" is not a valid URL.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new JobIngestionError("INVALID_URL", `URL must start with http:// or https://.`);
  }
  return url;
}

/**
 * Server-side only (uses jsdom, which has no browser equivalent). Fetches
 * the page, strips boilerplate (nav/ads/scripts) via Readability, and
 * returns clean article text. Never runs in the browser - the API route
 * that calls this is the trust boundary.
 */
export class UrlJobContentProvider implements JobContentProvider {
  async getContent(input: string): Promise<JobContentResult> {
    const url = assertValidUrl(input);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; CareerGraphBot/0.1; +job-ingestion) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (err) {
      const reason = err instanceof Error && err.name === "AbortError" ? "timed out" : "could not be reached";
      throw new JobIngestionError("URL_UNREACHABLE", `The page ${reason}. Try pasting the job description instead.`);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      if ([401, 403, 429, 999].includes(response.status)) {
        throw new JobIngestionError(
          "URL_BLOCKED",
          `This site blocked automated access (HTTP ${response.status}). Try pasting the job description instead.`,
        );
      }
      throw new JobIngestionError("URL_UNREACHABLE", `The page returned an error (HTTP ${response.status}).`);
    }

    const html = await response.text();

    let article: ReturnType<Readability["parse"]> = null;
    try {
      const dom = new JSDOM(html, { url: url.toString() });
      article = new Readability(dom.window.document).parse();
    } catch {
      throw new JobIngestionError("URL_UNREACHABLE", "The page content could not be read.");
    }

    const text = article?.textContent?.trim() ?? "";
    if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
      throw new JobIngestionError(
        "URL_BLOCKED",
        "Couldn't extract readable content from this page (it may require JavaScript or a login). Try pasting the job description instead.",
      );
    }

    return { text, sourceUrl: url.toString() };
  }
}
