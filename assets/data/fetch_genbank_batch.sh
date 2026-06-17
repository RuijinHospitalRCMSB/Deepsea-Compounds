#!/usr/bin/env bash
# Batch NCBI GenBank lookup — processes a slice of strains
# Usage: bash fetch_genbank_batch.sh START_IDX END_IDX [RESULT_FILE]
set -euo pipefail

STRAINS_JS="$1"
START="${2:-0}"
END="${3:-10}"
OUT="${4:-/sessions/gifted-elegant-mccarthy/mnt/66-Correct-html/assets/data/genbank_lookup.json}

# Extract organism names from JS
NAMES=()
while IFS= read -r line; do
  name="${line#*\"o\":\"}"
  name="${name%\"}"
  NAMES+=("$name")
done < <(grep -oP '"o":"[^"]+"' "$STRAINS_JS" | sed 's/"o":"//;s/"$//')

TOTAL="${#NAMES[@]}"
echo "Total strains: $TOTAL, processing slice $START..$END (max index: $((TOTAL-1)))"

# If output exists, load existing results
MATCHED_JSON="{}"
ERRORS_JSON="[]"
if [ -f "$OUT" ]; then
  echo "Loading existing results from $OUT"
  CONTENT=$(cat "$OUT")
  MATCHED_JSON=$(echo "$CONTENT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get('matched',{})))" 2>/dev/null || echo "{}")
  ERRORS_JSON=$(echo "$CONTENT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get('errors',[])))" 2>/dev/null || echo "[]")
fi

NCBI_BASE="https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
DELAY=0.4

for i in $(seq "$START" "$END"); do
  [ "$i" -ge "$TOTAL" ] && break

  org="${NAMES[$i]:-}"
  [ -z "$org" ] && continue

  # Skip if already in matched results (quick check)
  if echo "$MATCHED_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); exit(0 if '$org' in d else 1)" 2>/dev/null; then
    echo "[$((i+1))/$TOTAL] SKIP — $org already processed"
    continue
  fi

  echo "[$((i+1))/$TOTAL] $org"

  # --- ESearch ---
  strain_id=$(echo "$org" | grep -oP '(MCCC\s+\S+|FS\d+|SCSIO\s+\S+|CS-\d+|SD-\d+|YPGA\d+|MT1\.\d+|OUPS-T\d+B-\d+|CXCTD-\S+|HDN\d+|SY\d+|W\d+|FL\d+|Ea\d+|IW\d+|M-\d+|Nq\d+|ZEN-\d+|NTK\s+\S+|JMF\d+|SK6YW3L|NA-S01-R1|F\d+-\d+|CNB-\d+|DPJ\d+\s*/\s*RV\d+|nPS\d+|SHA\d+|SB-\d+)' | head -1)

  if [ -n "$strain_id" ]; then
    query="${strain_id}[All Fields] AND ${org}[Organism]"
  else
    query="${org}[Organism]"
  fi

  encoded_query=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$query'''))")
  search_url="${NCBI_BASE}/esearch.fcgi?db=nuccore&term=${encoded_query}&retmax=3&retmode=json&sort=relevance"
  resp=$(curl -s --max-time 10 "$search_url")
  uids=$(echo "$resp" | python3 -c "import json,sys; d=json.load(sys.stdin); print(','.join(d.get('esearchresult',{}).get('idlist',[])))" 2>/dev/null || echo "")

  if [ -z "$uids" ]; then
    # Fallback: try just the organism name
    encoded_query=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$org'))")
    search_url="${NCBI_BASE}/esearch.fcgi?db=nuccore&term=${encoded_query}[Organism]&retmax=3&retmode=json&sort=relevance"
    resp=$(curl -s --max-time 10 "$search_url")
    uids=$(echo "$resp" | python3 -c "import json,sys; d=json.load(sys.stdin); print(','.join(d.get('esearchresult',{}).get('idlist',[])))" 2>/dev/null || echo "")
  fi

  if [ -z "$uids" ]; then
    echo "  No match"
    ERRORS_JSON=$(echo "$ERRORS_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); d.append('$org'); print(json.dumps(d))")
    sleep "$DELAY"
    continue
  fi

  first_uid=$(echo "$uids" | cut -d, -f1)

  # --- ESummary ---
  summary_url="${NCBI_BASE}/esummary.fcgi?db=nuccore&id=${first_uid}&retmode=json"
  summary_resp=$(curl -s --max-time 10 "$summary_url")

  acc=$(echo "$summary_resp" | python3 -c "import json,sys;d=json.load(sys.stdin);r=d.get('result',{});u=r.get('uids',[]);print(r.get(str(u[0]),{}).get('accession','') if u else '')" 2>/dev/null || echo "")
  title=$(echo "$summary_resp" | python3 -c "import json,sys;d=json.load(sys.stdin);r=d.get('result',{});u=r.get('uids',[]);print(r.get(str(u[0]),{}).get('title','') if u else '')" 2>/dev/null || echo "")
  slen=$(echo "$summary_resp" | python3 -c "import json,sys;d=json.load(sys.stdin);r=d.get('result',{});u=r.get('uids',[]);print(r.get(str(u[0]),{}).get('slen','0') if u else '0')" 2>/dev/null || echo "0")
  taxid=$(echo "$summary_resp" | python3 -c "import json,sys;d=json.load(sys.stdin);r=d.get('result',{});u=r.get('uids',[]);print(r.get(str(u[0]),{}).get('taxid','0') if u else '0')" 2>/dev/null || echo "0")

  echo "  acc=$acc len=$slen taxid=$taxid"

  sleep "$DELAY"

  # --- EFetch for detailed GenBank ---
  gb_url="${NCBI_BASE}/efetch.fcgi?db=nuccore&id=${first_uid}&rettype=gb&retmode=text"
  gb_text=$(curl -s --max-time 15 "$gb_url")

  # Parse GenBank with Python
  entry=$(python3 -c "
import json, re
gb_text = '''$gb_text'''
result = {}
m = re.search(r'LOCUS\s+(\S+)\s+(\d+)\s+bp', gb_text)
if m:
    result['acc'] = m.group(1)
    result['seqLen'] = int(m.group(2))
m = re.search(r'DEFINITION\s+(.+?)(?:\n\s{2}|\n//)', gb_text, re.DOTALL)
if m:
    result['definition'] = m.group(1).replace(chr(10), ' ').strip()
m = re.search(r'ORGANISM\s+(.+?)\n', gb_text)
if m:
    result['sciName'] = m.group(1).strip()
m = re.search(r'db_xref=\"taxon:(\d+)\"', gb_text)
if m:
    result['taxId'] = int(m.group(1))
m = re.search(r'/mol_type=\"([^\"]+)\"', gb_text)
if m:
    result['molType'] = m.group(1)
m = re.search(r'/isolation_source=\"([^\"]+)\"', gb_text)
if m:
    result['isolation'] = m.group(1)
m = re.search(r'/strain=\"([^\"]+)\"', gb_text)
if m:
    result['culture'] = m.group(1)
m = re.search(r'/lat_lon=\"([^\"]+)\"', gb_text)
if m:
    result['coords'] = m.group(1)
m = re.search(r'/altitude=\"([^\"]+)\"', gb_text)
if m:
    result['altitude'] = m.group(1)
m = re.search(r'AUTHORS\s+(.+?)\n', gb_text)
if m:
    result['authors'] = m.group(1).strip()
m = re.search(r'TITLE\s+(.+?)\n', gb_text)
if m:
    result['paperTitle'] = m.group(1).strip()
m = re.search(r'JOURNAL\s+(.+?)\n', gb_text)
if m:
    result['journal'] = m.group(1).strip()
m = re.search(r'Submitted\s+\((\d+-\w+-\d+)\)\s*\n\s+(.+?)(?:\n\S|\n\s*\n)', gb_text, re.DOTALL)
if m:
    result['submitted'] = m.group(1)
    result['institution'] = m.group(2).replace(chr(10), ' ').strip()
print(json.dumps(result))
" 2>/dev/null || echo "{}")

  # Merge
  final_entry=$(python3 -c "
import json, sys
e = json.loads('''$entry''')
result = {
    'acc': e.get('acc', '$acc'),
    'seqLen': e.get('seqLen', $slen),
    'sciName': e.get('sciName', ''),
    'definition': e.get('definition', '''$title'''[:200] if '''$title''' else ''),
    'molType': e.get('molType', ''),
    'isolation': e.get('isolation', ''),
    'culture': e.get('culture', ''),
    'coords': e.get('coords', ''),
    'altitude': e.get('altitude', ''),
    'authors': e.get('authors', ''),
    'paperTitle': e.get('paperTitle', ''),
    'institution': e.get('institution', ''),
    'submitted': e.get('submitted', ''),
    'taxId': $taxid if $taxid else e.get('taxId', 0)
}
print(json.dumps(result, ensure_ascii=False))
")

  esc_org=$(python3 -c "import json; print(json.dumps('$org'))")
  MATCHED_JSON=$(python3 -c "
import json, sys
d = json.load(sys.stdin)
d[$esc_org] = json.loads('''$final_entry''')
print(json.dumps(d, ensure_ascii=False))
")

  echo "  ✓ $acc"
  sleep "$DELAY"
done

# Write final output
python3 -c "
import json
matched = json.loads('''$MATCHED_JSON''')
errors = json.loads('''$ERRORS_JSON''')
with open('$OUT', 'w', encoding='utf-8') as f:
    json.dump({'matched': matched, 'errors': errors}, f, ensure_ascii=False, indent=2)
print('Saved: ' + str(len(matched)) + ' matched, ' + str(len(errors)) + ' errors')
"
