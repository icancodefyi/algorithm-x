export interface CaseData {
  case_id: string;
  created_at: number;
  anonymous: boolean;
  platform_source: string;
  issue_type: string;
  description?: string | null;
  pipeline_type?: "deepfake" | "ncii" | string | null;
}

export interface AlgorithmSignal {
  name: string;
  value: string;
  flagged: boolean;
  weight: number;
}

export interface TamperRegion {
  id: number;
  bbox: { x: number; y: number; w: number; h: number };
  area_pct: number;
  type: string;
}

export interface HashVotes {
  phash_distance: number;
  dhash_distance: number;
  ahash_distance: number;
  consensus: string;
  flagged: boolean;
}

export interface AuditTrail {
  suspicious_sha256: string;
  reference_sha256: string | null;
  pipeline_version: string;
  algorithms_run: string[];
  analysis_timestamp: number;
  report_hash: string;
}

export interface C2paResult {
  status: "verified" | "trust_warning" | "invalid" | "not_present";
  issuer: string | null;        // common_name (e.g. "Google Media Processing Services")
  issuer_org: string | null;    // organisation name (e.g. "Google LLC")
  generator_tool: string | null;
  signing_time: string | null;  // ISO-8601
  ai_generated: boolean;
  ai_label: string | null;
  actions_summary: string[];    // human-readable action descriptions
  validation_errors: string[];
  assertions: string[];
}

export interface AiDetectionResult {
  ai_probability: number;
  ai_flagged: boolean;
  fft_grid_score: number;
  fft_grid_flagged: boolean;
  prnu_score: number;
  prnu_flagged: boolean;
  ca_score: number;
  ca_flagged: boolean;
  model_name?: string | null;
  model_label?: string | null;
  model_probability?: number | null;
  model_error?: string | null;
  heuristic_probability?: number | null;
  signal_source?: string | null;
}

export interface DiscoveryMatch {
  domain: string;
  network?: string | null;
  provider_type?: string | null;
  page_url: string;
  image_url: string;
  asset_type: string;
  confidence: number;
  match_type: "exact" | "near_duplicate" | "probable";
  phash_distance: number;
  dhash_distance: number;
  ahash_distance: number;
  ssim_score: number;
}

export interface DiscoveryRelatedDomain {
  domain: string;
  network: string;
  provider_type?: string | null;
  reason: string;
}

export interface DiscoveryEvent {
  timestamp: number;
  type: "domain" | "page" | "asset" | "match" | "info" | "error";
  message: string;
  domain?: string | null;
  page_url?: string | null;
  asset_url?: string | null;
  asset_type?: string | null;
  preview_url?: string | null;
  match_type?: string | null;
  confidence?: number | null;
}

export interface DiscoveryResult {
  case_id: string;
  status: "queued" | "running" | "completed" | "failed";
  started_at: number;
  finished_at?: number | null;
  prioritized_network?: string | null;
  target_domains: string[];
  current_domain?: string | null;
  current_page?: string | null;
  current_asset?: string | null;
  domains_scanned: number;
  pages_scanned: number;
  candidates_evaluated: number;
  direct_matches: DiscoveryMatch[];
  related_domains: DiscoveryRelatedDomain[];
  recent_events: DiscoveryEvent[];
  error?: string | null;
}

export interface AnalysisResult {
  case_id: string;
  file_hash: string;
  file_size: number;
  mime_type: string;
  timestamp: number;
  // Primary verdict
  authenticity_score: number;
  risk_level: string;
  forensic_certainty?: string;
  manipulation_probability: number;
  // Classic signals
  c2pa_status: string;
  metadata_integrity: string;
  explanation: string;
  signals: Record<string, unknown>;
  // Extended fields
  dimensions?: { width: number; height: number };
  metadata_detail?: {
    software: string | null;
    camera_model: string | null;
    has_gps: boolean;
    exif_present: boolean;
    creation_date: string | null;
    software_suspicious: boolean;
  };
  metadata_comparison?: {
    same_camera_model: boolean;
    creation_date_match: boolean;
    suspicious_software: string | null;
    reference_software: string | null;
    gps_present_suspicious: boolean;
    gps_present_reference: boolean;
  };
  reference_based?: boolean;
  reference_similarity?: {
    ssim_score: number;
    pixel_diff_mean: number | null;
  };
  hash_votes?: HashVotes;
  algorithm_signals?: AlgorithmSignal[];
  ela_result?: { mean_residual: number; flagged: boolean };
  dct_result?: { blocking_score: number; double_compression_likely: boolean };
  color_histogram?: { kl_divergence_mean: number; flagged: boolean };
  noise_analysis?: { noise_ratio: number; noise_inconsistent: boolean };
  keypoints?: { match_rate: number; good_matches: number; flagged: boolean };
  tamper_heatmap?: string;
  ela_heatmap?: string;
  tamper_regions?: TamperRegion[];
  audit?: AuditTrail;
  c2pa_result?: C2paResult;
  ai_detection?: AiDetectionResult;
  supporting_evidence?: {
    sha256: string;
    ela_mean_residual: number;
    ela_flagged: boolean;
    ela_heatmap?: string | null;
    manipulation_note: string;
    used_as: string;
  } | null;
}
