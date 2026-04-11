"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { AnalysisLoader } from "@/components/dashboard/AnalysisLoader";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

const ISSUE_TYPES = [
  { value: "AI-generated / synthetic face in clip", label: "AI / synthetic face in clip" },
  { value: "Face swap or manipulated video frame", label: "Face swap / manipulated frame" },
  { value: "Scam or coercion clip (MMS / RCS)", label: "Scam / coercion clip" },
  { value: "Other MMS-linked manipulation", label: "Other" },
];

async function videoFileToJpegFile(videoFile: File): Promise<{ file: File; previewUrl: string }> {
  const objectUrl = URL.createObjectURL(videoFile);
  const video = document.createElement("video");
  video.src = objectUrl;
  video.muted = true;
  video.playsInline = true;

  await new Promise<void>((resolve, reject) => {
    const to = window.setTimeout(() => reject(new Error("Video load timed out.")), 45000);
    const done = () => {
      window.clearTimeout(to);
      resolve();
    };
    video.onloadeddata = done;
    video.onerror = () => {
      window.clearTimeout(to);
      reject(new Error("Could not load this video in the browser."));
    };
  });

  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
  const seekTo = Math.min(0.75, Math.max(0.05, duration * 0.22));
  video.currentTime = seekTo;

  await new Promise<void>((resolve, reject) => {
    const to = window.setTimeout(() => reject(new Error("Seek timed out.")), 15000);
    video.onseeked = () => {
      window.clearTimeout(to);
      resolve();
    };
    video.onerror = () => {
      window.clearTimeout(to);
      reject(new Error("Could not seek in this video."));
    };
  });

  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) {
    URL.revokeObjectURL(objectUrl);
    throw new Error("Video has no readable frame dimensions.");
  }

  const maxDim = 1920;
  let cw = w;
  let ch = h;
  if (w > maxDim) {
    cw = maxDim;
    ch = Math.round((h / w) * maxDim);
  }

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(objectUrl);
    throw new Error("Canvas is not available in this browser.");
  }
  ctx.drawImage(video, 0, 0, cw, ch);
  URL.revokeObjectURL(objectUrl);

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob((b) => res(b), "image/jpeg", 0.9),
  );
  if (!blob) throw new Error("Could not encode a JPEG from the video frame.");

  if (blob.size > 10 * 1024 * 1024) {
    throw new Error("Extracted frame is too large (>10 MB). Try a shorter or lower-resolution clip.");
  }

  const base = videoFile.name.replace(/\.[^.]+$/, "") || "mms-clip";
  const file = new File([blob], `${base}-frame.jpg`, { type: "image/jpeg" });
  const previewUrl = URL.createObjectURL(blob);
  return { file, previewUrl };
}

async function storePreview(dataUrl: string, key: string) {
  try {
    sessionStorage.setItem(key, dataUrl);
  } catch {
    /* non-critical */
  }
}

export default function MmsVideoCommandPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0].value);
  const [notes, setNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [framePreview, setFramePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const clearVideo = useCallback(() => {
    setVideoFile(null);
    setVideoObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFramePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  function onPickVideo(f: File | null) {
    clearVideo();
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("Please choose a video file (MP4, WebM, MOV, etc.).");
      return;
    }
    if (f.size > MAX_VIDEO_BYTES) {
      setError(`Video must be under ${MAX_VIDEO_BYTES / (1024 * 1024)} MB.`);
      return;
    }
    setError(null);
    setVideoFile(f);
    setVideoObjectUrl(URL.createObjectURL(f));
  }

  async function startAnalysis() {
    if (!videoFile) return;
    setAnalyzing(true);
    setError(null);
    setFramePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    let suspiciousFile: File;
    let suspiciousPreview: string;

    try {
      const { file, previewUrl } = await videoFileToJpegFile(videoFile);
      suspiciousFile = file;
      suspiciousPreview = previewUrl;
      setFramePreview(previewUrl);
    } catch (e) {
      setAnalyzing(false);
      setError(e instanceof Error ? e.message : "Could not extract a frame from the video.");
      return;
    }

    try {
      const caseRes = await fetch(`${API_URL}/api/cases/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous: true,
          platform_source: "MMS / RCS / mobile video",
          issue_type: issueType,
          description: notes.trim() || undefined,
          pipeline_type: "mms_video",
        }),
      });
      if (!caseRes.ok) {
        const err = (await caseRes.json().catch(() => ({}))) as { detail?: string };
        throw new Error(err.detail || "Failed to create case");
      }
      const { case_id: caseId } = (await caseRes.json()) as { case_id: string };

      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = suspiciousPreview;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(() => resolve(), 3000);
      });
      if (img.width) {
        canvas.width = Math.min(img.width, 480);
        canvas.height = Math.round((canvas.width / img.width) * img.height);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        await storePreview(canvas.toDataURL("image/jpeg", 0.75), `sniffer_suspicious_${caseId}`);
      }

      const formData = new FormData();
      formData.append("suspicious_image", suspiciousFile);

      const analysisRes = await fetch(`${API_URL}/api/analysis/${caseId}/run`, {
        method: "POST",
        body: formData,
      });
      if (!analysisRes.ok) {
        const err = (await analysisRes.json().catch(() => ({}))) as { detail?: string };
        throw new Error(err.detail || "Analysis failed");
      }

      void fetch("/api/security/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "mms_video_verify",
          severity: "medium",
          title: "MMS / video clip analysis completed",
          message: `${issueType}. Keyframe sent to the same forensic pipeline as still-image verify.`,
          entityId: caseId,
          href: `/report/${caseId}/analysis`,
        }),
      }).catch(() => {});

      const discoveryData = new FormData();
      discoveryData.append("suspicious_image", suspiciousFile);
      void fetch(`${API_URL}/api/analysis/${caseId}/discover`, {
        method: "POST",
        body: discoveryData,
      }).catch(() => {});

      router.push(`/report/${caseId}/analysis`);
    } catch (e) {
      setAnalyzing(false);
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {analyzing && (
        <AnalysisLoader image={framePreview ?? ""} onComplete={() => {}} />
      )}

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Security Command</p>
            <h1 className="text-xl font-semibold text-zinc-900">MMS / video clip</h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-600">
              Upload a short clip you received over MMS, RCS, or chat. We grab one keyframe (~22% into the
              clip) and run the same authenticity pipeline as{" "}
              <Link href="/verify/upload" className="text-indigo-600 underline-offset-2 hover:underline">
                deepfake still-image verify
              </Link>
              — kept separate so analysts can track mobile-originated evidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/verify/upload"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              Deepfake (image)
            </Link>
            <Link
              href="/command"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              ← Command
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-800">1. Video file</h2>
          <p className="mt-1 text-xs text-zinc-500">
            MP4 / WebM / MOV typical. Max {MAX_VIDEO_BYTES / (1024 * 1024)} MB. One frame is extracted in
            your browser — the full video is not uploaded to the analysis service.
          </p>

          <div className="mt-4">
            {!videoFile ? (
              <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition ${
                  dragging
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f) onPickVideo(f);
                }}
              >
                <span className="text-sm font-medium text-zinc-700">Choose video file</span>
                <span className="mt-1 text-xs text-zinc-500">or drag and drop (click to browse)</span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => onPickVideo(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  ref={videoRef}
                  src={videoObjectUrl ?? undefined}
                  controls
                  className="max-h-64 w-full rounded-lg border border-zinc-200 bg-black"
                />
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-700">
                  <span className="font-medium">{videoFile.name}</span>
                  <span className="text-zinc-500">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <button
                    type="button"
                    onClick={clearVideo}
                    className="ml-auto rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-800">2. Case context</h2>
          <p className="mt-1 text-xs text-zinc-500">How should we label this MMS-style case?</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ISSUE_TYPES.map((it) => (
              <button
                key={it.value}
                type="button"
                onClick={() => setIssueType(it.value)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  issueType === it.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-950"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-xs font-medium text-zinc-600" htmlFor="mms-notes">
            Optional notes (sender hint, thread ID, etc.)
          </label>
          <textarea
            id="mms-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
            placeholder="e.g. Unknown number, clip forwarded from family group…"
          />
        </section>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!videoFile || analyzing}
            onClick={() => void startAnalysis()}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Extract keyframe &amp; analyze
          </button>
          <span className="text-xs text-zinc-500">
            Opens the same forensic report flow as image verify, with pipeline tagged{" "}
            <code className="rounded bg-zinc-200 px-1">mms_video</code>.
          </span>
        </div>
      </main>
    </div>
  );
}
