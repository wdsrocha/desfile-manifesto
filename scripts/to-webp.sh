#!/usr/bin/env bash
# Convert images to .webp using `cwebp` (from libwebp).
# HEIC/HEIF go through `sips` (macOS) as a PNG intermediary first.
#
# Requires:
#   - cwebp   (brew install webp)    — handles jpg/jpeg/png/tiff directly
#   - sips    (macOS, built-in)      — only used to decode HEIC/HEIF/BMP/GIF
#
# Usage:
#   scripts/to-webp.sh <file>              outputs <file>.webp next to the source
#   scripts/to-webp.sh <dir>               converts every image in <dir> into <dir>-webp/
#   scripts/to-webp.sh <dir> <out-dir>     custom output directory
#
# Source basenames are preserved — drop the originals as look01.heic, look02.png …
# and the script outputs look01.webp, look02.webp ready to upload to Vercel Blob.
#
# Override quality with QUALITY=90 npm run to-webp ./photo.jpg (default: 82).

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <file|dir> [out-dir]" >&2
  exit 1
fi

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found. Install with: brew install webp" >&2
  exit 1
fi

QUALITY="${QUALITY:-82}"

convert_one() {
  local input="$1"
  local output="$2"
  local ext_lower
  ext_lower=$(printf '%s' "${input##*.}" | tr '[:upper:]' '[:lower:]')

  mkdir -p "$(dirname "$output")"

  case "$ext_lower" in
    jpg|jpeg|png|tif|tiff)
      cwebp -quiet -q "$QUALITY" "$input" -o "$output"
      ;;
    heic|heif|bmp|gif)
      local tmpdir
      tmpdir=$(mktemp -d -t to-webp)
      trap 'rm -rf "$tmpdir"' RETURN
      sips -s format png "$input" --out "$tmpdir/in.png" >/dev/null
      cwebp -quiet -q "$QUALITY" "$tmpdir/in.png" -o "$output"
      rm -rf "$tmpdir"
      trap - RETURN
      ;;
    *)
      echo "Unsupported extension: $input" >&2
      return 1
      ;;
  esac

  echo "→ $output"
}

src="$1"

if [ -f "$src" ]; then
  convert_one "$src" "${src%.*}.webp"
  exit 0
fi

if [ -d "$src" ]; then
  dst="${2:-${src%/}-webp}"
  shopt -s nullglob nocaseglob
  count=0
  for f in "$src"/*.{jpg,jpeg,png,heic,heif,tiff,tif,bmp,gif}; do
    base=$(basename "$f")
    convert_one "$f" "$dst/${base%.*}.webp"
    count=$((count + 1))
  done
  echo "Done. $count file(s) → $dst"
  exit 0
fi

echo "Not found: $src" >&2
exit 1
