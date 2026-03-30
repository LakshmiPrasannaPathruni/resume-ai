import nltk
nltk.download('stopwords')
import os
import spacy
from spacy.matcher import Matcher
from pyresparser import utils, resume_parser


# =====================================================
# 1️⃣ SAFE FIX spaCy model load (prevent config.cfg error & recursion)
# =====================================================
# Keep a reference to the original spaCy.load so we don’t call ourselves recursively
_original_spacy_load = spacy.load

def safe_spacy_load(*args, **kwargs):
    """Always load the official en_core_web_sm model safely."""
    return _original_spacy_load("en_core_web_sm")

# Monkey-patch pyresparser’s spaCy loader to use our safe version
resume_parser.spacy.load = safe_spacy_load


# =====================================================
# 2️⃣ FIX Matcher.add() API difference in spaCy v3+
# =====================================================
def get_safe_matcher(vocab):
    """Return a Matcher instance with a patched add() method."""
    matcher = Matcher(vocab)

    def add_safe(name, patterns, *args, **kwargs):
        """SpaCy v3-compatible patch for matcher.add()"""
        # Handle tuple patterns -> convert to list of dicts
        if isinstance(patterns, tuple):
            patterns = list(patterns)
        if isinstance(patterns, list) and all(isinstance(p, tuple) for p in patterns):
            new_patterns = []
            for p in patterns:
                subpat = []
                for token in p:
                    if isinstance(token, str):
                        subpat.append({'TEXT': {'REGEX': token}})
                    elif isinstance(token, dict):
                        subpat.append(token)
                new_patterns.append(subpat)
            patterns = new_patterns
        # Use spaCy internal _add safely
        return matcher._add(name, patterns, on_match=None)

    matcher.add_safe = add_safe  # attach our safe add function as instance method
    return matcher


# =====================================================
# 3️⃣ FIX extract_name() invalid pattern format + fallback
# =====================================================
def safe_extract_name(nlp_text, matcher=None):
    """
    Replaces old pattern logic with spaCy v3-compatible pattern.
    Works even if matcher is created by PyResparser internally.
    """
    if matcher is None:
        matcher = get_safe_matcher(nlp_text.vocab)

    # Proper dict-based pattern for spaCy v3
    pattern = [{'POS': 'PROPN'}, {'POS': 'PROPN'}]

    # Use add_safe() if available, else fallback to add()
    if hasattr(matcher, "add_safe"):
        matcher.add_safe('NAME', [pattern])
    else:
        matcher.add('NAME', [pattern])  # spaCy v3 correct call

    matches = matcher(nlp_text)
    for _, start, end in matches:
        span = nlp_text[start:end]
        return span.text
    return None

# Override pyresparser’s old extract_name
utils.extract_name = safe_extract_name
# =====================================================


# ✅ Now safely import ResumeParser
from pyresparser import ResumeParser


class ResumeReader:
    """Wrapper class around pyresparser for clean resume parsing."""

    def __init__(self, upload_path: str):
        self.upload_path = upload_path

    def parse_resume(self, filename: str):
        """Extracts data from resume using patched pyresparser."""
        file_path = os.path.join(self.upload_path, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError("Resume file not found.")

        try:
            data = ResumeParser(file_path).get_extracted_data()
        except Exception as e:
            raise RuntimeError(f"Error parsing resume: {e}")

        # Remove empty/None fields for cleaner response
        return {k: v for k, v in data.items() if v not in [None, [], '', {}]}
