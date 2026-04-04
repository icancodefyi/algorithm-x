"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AnalysisResult, CaseData } from "@/components/report/types";
import { buildCaseRef } from "@/components/report/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ReportWorkflowContextValue {
  caseId: string;
  caseData: CaseData | null;
  analysis: AnalysisResult | null;
  suspiciousImg: string | null;
  referenceImg: string | null;
  evidenceImg: string | null;
  loading: boolean;
  fetchError: string | null;
  hashCopied: boolean;
  isCaseSaved: boolean;
  isSaving: boolean;
  copyHash: () => void;
  handleSaveCase: () => Promise<void>;
}

const ReportWorkflowContext = createContext<ReportWorkflowContextValue | null>(null);

export function ReportWorkflowProvider({
  caseId,
  children,
}: {
  caseId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [suspiciousImg, setSuspiciousImg] = useState<string | null>(null);
  const [referenceImg, setReferenceImg] = useState<string | null>(null);
  const [evidenceImg, setEvidenceImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hashCopied, setHashCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCaseSaved, setIsCaseSaved] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    setSuspiciousImg(sessionStorage.getItem(`sniffer_suspicious_${caseId}`));
    setReferenceImg(sessionStorage.getItem(`sniffer_reference_${caseId}`));
    setEvidenceImg(sessionStorage.getItem(`sniffer_evidence_${caseId}`));

    setLoading(true);
    setFetchError(null);

    fetch(`/api/cases/${caseId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Case not found");
        return r.json() as Promise<CaseData>;
      })
      .then(async (c) => {
        setCaseData(c);

        if (c.pipeline_type === "ncii") {
          setAnalysis(null);
          return;
        }

        try {
          const aRes = await fetch(`${API_URL}/api/analysis/${caseId}/result`);
          if (!aRes.ok) {
            setAnalysis(null);
            return;
          }
          const a = (await aRes.json()) as AnalysisResult;
          setAnalysis(a);
        } catch {
          setAnalysis(null);
        }
      })
      .catch((e: unknown) => {
        setCaseData(null);
        setAnalysis(null);
        setFetchError(e instanceof Error ? e.message : "Failed to load report");
      })
      .finally(() => setLoading(false));
  }, [caseId]);

  useEffect(() => {
    if (searchParams.get("autosave") !== "1" || !caseData) return;
    if (caseData.pipeline_type !== "ncii" && !analysis) return;

    setIsSaving(true);
    fetch("/api/cases/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId,
        domain: caseData.platform_source,
        caseRef: buildCaseRef(caseId),
      }),
    })
      .then(() => {
        setIsCaseSaved(true);
        router.replace(`/report/${caseId}/analysis`, { scroll: false });
      })
      .finally(() => setIsSaving(false));
  }, [searchParams, caseData, analysis, caseId, router]);

  function copyHash() {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.file_hash).then(() => {
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 2000);
    });
  }

  async function handleSaveCase() {
    if (!caseData) return;
    if (caseData.pipeline_type !== "ncii" && !analysis) return;

    setIsSaving(true);
    await fetch("/api/cases/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId,
        domain: caseData.platform_source,
        caseRef: buildCaseRef(caseId),
      }),
    });
    setIsCaseSaved(true);
    setIsSaving(false);
  }

  const value = useMemo<ReportWorkflowContextValue>(
    () => ({
      caseId,
      caseData,
      analysis,
      suspiciousImg,
      referenceImg,
      evidenceImg,
      loading,
      fetchError,
      hashCopied,
      isCaseSaved,
      isSaving,
      copyHash,
      handleSaveCase,
    }),
    [
      caseId,
      caseData,
      analysis,
      suspiciousImg,
      referenceImg,
      evidenceImg,
      loading,
      fetchError,
      hashCopied,
      isCaseSaved,
      isSaving,
    ],
  );

  return <ReportWorkflowContext.Provider value={value}>{children}</ReportWorkflowContext.Provider>;
}

export function useReportWorkflow() {
  const ctx = useContext(ReportWorkflowContext);
  if (!ctx) throw new Error("useReportWorkflow must be used within ReportWorkflowProvider");
  return ctx;
}
