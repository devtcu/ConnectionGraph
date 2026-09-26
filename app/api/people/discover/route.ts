import { NextResponse } from "next/server";
import { getPersonDiscoveryProvider } from "@/lib/people/discovery/getPersonDiscoveryProvider";
import { PersonDiscoveryError, type PersonDiscoveryErrorCode } from "@/lib/people/errors";
import { JobProfileSchema } from "@/lib/jobs/schema";

const STATUS_BY_CODE: Record<PersonDiscoveryErrorCode, number> = {
  NOT_CONFIGURED: 501,
  SEARCH_FAILED: 502,
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "SEARCH_FAILED", message: "Request body must be JSON." } }, { status: 400 });
  }

  const { jobProfile: rawJobProfile } = (body ?? {}) as { jobProfile?: unknown };
  const parsedJobProfile = JobProfileSchema.safeParse(rawJobProfile);
  if (!parsedJobProfile.success) {
    return NextResponse.json(
      { error: { code: "SEARCH_FAILED", message: "Request must include a valid jobProfile." } },
      { status: 400 },
    );
  }

  try {
    const provider = getPersonDiscoveryProvider();
    const people = await provider.discoverPeople(parsedJobProfile.data);
    return NextResponse.json({ people });
  } catch (err) {
    if (err instanceof PersonDiscoveryError) {
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: STATUS_BY_CODE[err.code] });
    }
    console.error("Unexpected person discovery error:", err);
    return NextResponse.json(
      { error: { code: "SEARCH_FAILED", message: "Something went wrong while searching for people." } },
      { status: 500 },
    );
  }
}
