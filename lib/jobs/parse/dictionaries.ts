// Plain keyword dictionaries used by the heuristic parser. Deliberately
// simple substring/word-boundary matches, not NLP - every hit is a literal
// term found in the posting, so nothing here can "invent" information.

export const SKILL_DICTIONARY = [
  "Python",
  "PyTorch",
  "TensorFlow",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "SQL",
  "NoSQL",
  "AWS",
  "GCP",
  "Azure",
  "Kubernetes",
  "Docker",
  "Distributed Systems",
  "MLOps",
  "Deep Learning",
  "Machine Learning",
  "NLP",
  "Computer Vision",
  "Data Pipelines",
  "Data Engineering",
  "Git",
  "CI/CD",
  "REST",
  "GraphQL",
  "Java",
  "Go",
  "Rust",
  "C++",
  "Scala",
  "Spark",
  "Airflow",
  "Terraform",
  "Linux",
  "Product Management",
  "Figma",
  "SEO",
];

export const DOMAIN_DICTIONARY = [
  "Machine Learning",
  "Data Science",
  "ML Platform",
  "Data Platform",
  "Infrastructure",
  "Backend",
  "Frontend",
  "Full Stack",
  "DevOps",
  "Security",
  "Growth",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Finance",
  "Recruiting",
];

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary", "Freelance"];

// Ordered roughly junior -> senior so the first match in title-first scans still makes sense.
export const SENIORITY_LEVELS = [
  "Intern",
  "Entry-level",
  "Junior",
  "Associate",
  "Mid-level",
  "Senior",
  "Staff",
  "Principal",
  "Lead",
  "Director",
  "VP",
  "Head of",
];

export function findDictionaryMatches(text: string, dictionary: string[]): string[] {
  const found: string[] = [];
  for (const term of dictionary) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, "i");
    if (pattern.test(text)) found.push(term);
  }
  return found;
}
