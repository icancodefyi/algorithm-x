"""
Perceptual hashing — pHash, dHash, aHash — with multi-algorithm consensus vote.
Hamming distance is a structural similarity measure: 0 = identical, 64 = maximally different.
"""
import hashlib
import io

import imagehash
from PIL import Image

from .models import HashResult, HashVotes

# Distance above which a hash pair is considered "manipulated"
_HASH_THRESHOLD = 10


def compute_hashes(
    suspicious_bytes: bytes,
    reference_bytes: bytes,
) -> tuple[HashResult, HashResult, HashVotes]:
    susp_img = Image.open(io.BytesIO(suspicious_bytes)).convert("RGB")
    ref_img = Image.open(io.BytesIO(reference_bytes)).convert("RGB")

    susp_sha256 = hashlib.sha256(suspicious_bytes).hexdigest()
    ref_sha256 = hashlib.sha256(reference_bytes).hexdigest()

    s_ph = imagehash.phash(susp_img)
    r_ph = imagehash.phash(ref_img)
    phash_dist = int(s_ph - r_ph)

    s_dh = imagehash.dhash(susp_img)
    r_dh = imagehash.dhash(ref_img)
    dhash_dist = int(s_dh - r_dh)

    s_ah = imagehash.average_hash(susp_img)
    r_ah = imagehash.average_hash(ref_img)
    ahash_dist = int(s_ah - r_ah)

    # Majority vote: 2-of-3 above threshold = manipulated
    votes_flagged = sum([
        phash_dist > _HASH_THRESHOLD,
        dhash_dist > _HASH_THRESHOLD,
        ahash_dist > _HASH_THRESHOLD,
    ])
    if votes_flagged >= 2:
        consensus = "manipulated"
    elif votes_flagged == 1:
        consensus = "inconclusive"
    else:
        consensus = "authentic"

    susp_result = HashResult(
        sha256=susp_sha256,
        phash=str(s_ph),
        dhash=str(s_dh),
        ahash=str(s_ah),
    )
    ref_result = HashResult(
        sha256=ref_sha256,
        phash=str(r_ph),
        dhash=str(r_dh),
        ahash=str(r_ah),
    )
    votes = HashVotes(
        phash_distance=phash_dist,
        dhash_distance=dhash_dist,
        ahash_distance=ahash_dist,
        consensus=consensus,
        flagged=votes_flagged >= 2,
    )

    return susp_result, ref_result, votes
