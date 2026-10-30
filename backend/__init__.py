"""Backend package that also supports Vercel's backend-root service layout."""

from pathlib import Path
import sys

_backend_root = str(Path(__file__).resolve().parent)
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)
