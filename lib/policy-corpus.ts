import fs from "node:fs";
import path from "node:path";

export type PolicySection = {
  docId: string;
  documentTitle: string;
  sectionHeading: string;
  content: string;
};

const CORPUS_DIR = path.join(process.cwd(), "data", "policies");

const STOP = new Set(
  [
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "shall",
    "can",
    "need",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "as",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "just",
    "and",
    "but",
    "if",
    "or",
    "because",
    "until",
    "while",
    "about",
    "against",
    "between",
    "into",
    "throughout",
    "during",
    "without",
    "within",
    "what",
    "which",
    "who",
    "whom",
    "this",
    "that",
    "these",
    "those",
    "am",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "our",
    "your",
    "their",
    "my",
    "me",
    "us",
    "them",
  ].map((w) => w.toLowerCase()),
);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function parseMarkdownFile(filePath: string, docId: string): PolicySection[] {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\ufeff/, "");
  let docTitle = docId.replace(/\.md$/i, "").replace(/-/g, " ");
  let body = raw;

  const titleMatch = body.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    docTitle = titleMatch[1].trim();
    body = body.replace(/^#\s+.+\n+/, "");
  }

  const chunks = body.split(/^##\s+/m);
  const sections: PolicySection[] = [];

  if (chunks[0]?.trim()) {
    sections.push({
      docId,
      documentTitle: docTitle,
      sectionHeading: "Overview",
      content: chunks[0].trim(),
    });
  }

  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i] ?? "";
    const nl = chunk.indexOf("\n");
    const heading = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    const content = (nl === -1 ? "" : chunk.slice(nl + 1)).trim();
    if (heading || content) {
      sections.push({
        docId,
        documentTitle: docTitle,
        sectionHeading: heading || "Section",
        content: content || heading,
      });
    }
  }

  if (sections.length === 0 && raw.trim()) {
    sections.push({
      docId,
      documentTitle: docTitle,
      sectionHeading: "Document",
      content: raw.trim(),
    });
  }

  return sections;
}

export function loadPolicyCorpus(): PolicySection[] {
  if (!fs.existsSync(CORPUS_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(CORPUS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".md"));

  const all: PolicySection[] = [];
  for (const file of files) {
    const full = path.join(CORPUS_DIR, file);
    if (!fs.statSync(full).isFile()) continue;
    all.push(...parseMarkdownFile(full, file));
  }
  return all;
}

function scoreSection(query: string, section: PolicySection): number {
  const terms = tokenize(query);
  if (terms.length === 0) return 0;
  const hay = `${section.documentTitle}\n${section.sectionHeading}\n${section.content}`.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (hay.includes(t)) score += 1;
  }
  return score;
}

export function retrievePolicySections(
  query: string,
  sections: PolicySection[],
  topK: number,
): PolicySection[] {
  const scored = sections
    .map((s) => ({ s, score: scoreSection(query, s) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, topK).map((x) => x.s);
  }

  return sections.slice(0, Math.min(topK, sections.length));
}

export function excerpt(text: string, maxLen: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}
