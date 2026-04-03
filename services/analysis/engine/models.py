from pydantic import BaseModel
from typing import Optional, List


class MetadataResult(BaseModel):
    width: int
    height: int
    exif_present: bool
    software: Optional[str] = None
    camera_model: Optional[str] = None
    has_gps: bool = False
    creation_date: Optional[str] = None
    software_suspicious: bool = False
    integrity: str  # ok | anomalies_detected | missing


class HashResult(BaseModel):
    sha256: str
    phash: str
    dhash: str
    ahash: str


class HashVotes(BaseModel):
    phash_distance: int
    dhash_distance: int
    ahash_distance: int
    consensus: str  # authentic | inconclusive | manipulated
    flagged: bool


class SimilarityResult(BaseModel):
    ssim_score: float
    pixel_diff_mean: float
    flagged: bool


class ELAResult(BaseModel):
    ela_mean_residual: float
    ela_flagged: bool
    ela_heatmap: Optional[str] = None  # base64 PNG


class DCTResult(BaseModel):
    blocking_score: float
    double_compression_likely: bool


class ColorHistResult(BaseModel):
    kl_divergence_r: float
    kl_divergence_g: float
    kl_divergence_b: float
    kl_divergence_mean: float
    flagged: bool


class NoiseResult(BaseModel):
    suspicious_noise_std: float
    reference_noise_std: float
    noise_ratio: float
    noise_inconsistent: bool


class KeypointResult(BaseModel):
    keypoints_suspicious: int
    keypoints_reference: int
    good_matches: int
    match_rate: float
    flagged: bool


class TamperRegion(BaseModel):
    id: int
    bbox: dict  # {x, y, w, h}
    area_pct: float
    type: str = "splice"


class C2paResult(BaseModel):
    status: str  # verified | trust_warning | invalid | not_present
    issuer: Optional[str] = None            # X.509 CN / common_name
    issuer_org: Optional[str] = None        # X.509 O field (e.g. "Google LLC")
    generator_tool: Optional[str] = None    # claim_generator_info[0].name
    signing_time: Optional[str] = None      # ISO-8601 from signature_info.time
    ai_generated: bool = False
    ai_label: Optional[str] = None
    actions_summary: List[str] = []         # human-readable action descriptions
    validation_errors: List[str] = []
    assertions: List[str] = []


class AiDetectionResult(BaseModel):
    ai_probability: float
    ai_flagged: bool
    fft_grid_score: float
    fft_grid_flagged: bool
    prnu_score: float
    prnu_flagged: bool
    ca_score: float  # 0 = perfect channel alignment (AI); 1 = strong CA (real)
    ca_flagged: bool
    model_name: Optional[str] = None
    model_label: Optional[str] = None
    model_probability: Optional[float] = None
    model_error: Optional[str] = None
    heuristic_probability: Optional[float] = None
    signal_source: str = "heuristic"


class DiscoveryMatch(BaseModel):
    domain: str
    network: Optional[str] = None
    provider_type: Optional[str] = None
    page_url: str
    image_url: str
    asset_type: str
    confidence: float
    match_type: str  # exact | near_duplicate | probable
    phash_distance: int
    dhash_distance: int
    ahash_distance: int
    ssim_score: float


class DiscoveryRelatedDomain(BaseModel):
    domain: str
    network: str
    provider_type: Optional[str] = None
    reason: str


class DiscoveryEvent(BaseModel):
    timestamp: float
    type: str  # domain | page | asset | match | info | error
    message: str
    domain: Optional[str] = None
    page_url: Optional[str] = None
    asset_url: Optional[str] = None
    asset_type: Optional[str] = None
    preview_url: Optional[str] = None
    match_type: Optional[str] = None
    confidence: Optional[float] = None


class DiscoveryResult(BaseModel):
    case_id: str
    status: str  # queued | running | completed | failed
    started_at: float
    finished_at: Optional[float] = None
    prioritized_network: Optional[str] = None
    target_domains: List[str] = []
    current_domain: Optional[str] = None
    current_page: Optional[str] = None
    current_asset: Optional[str] = None
    domains_scanned: int = 0
    pages_scanned: int = 0
    candidates_evaluated: int = 0
    direct_matches: List[dict] = []
    related_domains: List[dict] = []
    recent_events: List[dict] = []
    error: Optional[str] = None


class AnalysisResult(BaseModel):
    # Core identity
    case_id: str
    file_hash: str
    file_size: int
    mime_type: str
    timestamp: float

    # Primary verdict
    authenticity_score: int
    risk_level: str
    forensic_certainty: str  # Verified Authentic | Likely Authentic | Inconclusive | Probable Manipulation | Highly Probable Manipulation | Near Certain Manipulation
    manipulation_probability: float

    # Classic signals (backward-compat with frontend)
    c2pa_status: str
    metadata_integrity: str
    explanation: str
    signals: dict

    # Image properties
    dimensions: Optional[dict] = None
    metadata_detail: Optional[dict] = None
    metadata_comparison: Optional[dict] = None

    # Reference analysis
    reference_based: bool = False
    reference_similarity: Optional[dict] = None
    hash_votes: Optional[dict] = None

    # Per-algorithm results
    algorithm_signals: List[dict] = []
    ela_result: Optional[dict] = None
    dct_result: Optional[dict] = None
    color_histogram: Optional[dict] = None
    noise_analysis: Optional[dict] = None
    keypoints: Optional[dict] = None

    # Visual evidence
    tamper_heatmap: Optional[str] = None   # base64 PNG — blended on suspicious
    ela_heatmap: Optional[str] = None      # base64 PNG — ELA residual map
    tamper_regions: List[dict] = []

    # New signals
    c2pa_result: Optional[dict] = None     # C2paResult.model_dump()
    ai_detection: Optional[dict] = None    # AiDetectionResult.model_dump()

    # Chain of custody
    audit: Optional[dict] = None

    # Supporting evidence (optional screenshot analysis)
    supporting_evidence: Optional[dict] = None
