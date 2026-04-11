export type PolicyCitation = {
  docId: string;
  documentTitle: string;
  sectionHeading: string;
  excerpt: string;
};

export type PolicyAskResponse = {
  answer_markdown: string;
  citations: PolicyCitation[];
  confidence: "high" | "medium" | "low";
  follow_up_questions?: string[];
};
