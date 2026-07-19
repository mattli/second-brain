Weekly Product Briefing — Instructions

> Version: 2.0 | Last updated: 2026-07-18

## Purpose
Each Saturday morning (before the weekly summary), research and compile a product intelligence briefing focused on what builders are actively shipping and promoting on X. The output should identify problem categories emerging from real builder activity and be saved to `resources/intelligence/weekly-products/YYYY-MM-DD.md` using today's actual date.

**Overlap Prevention:** Only include products that were shared in the last 7 days. Do not carry forward products from previous weeks unless there is genuinely new traction.

**Empty Sections:** If a source has no significant activity, move on. Never pad with low-signal content.

**Sources:** Use only the sources described below. Do not use Product Hunt, TechCrunch, or any other source not explicitly listed in these instructions.

---

## Before You Start

Read the last 3 weekly product briefings from `resources/intelligence/weekly-products/` (by date, most recent first). Note which products and problem categories were already covered. Do not repeat products unless there is a genuinely new development.

---

## Research Method

### Step 1: Find High-Engagement Threads via last30days IPC

Search for "share your product" threads on X with 50+ replies. These are the threads where builders promote their products to each other.

The query MUST include `min_replies:50` to filter to high-engagement threads only. Construct a proper Twitter search query with OR operators, quoted phrases, and a `since:` date for the last 7 days.

```bash
REQ_ID="thread-$(date +%s)-$(head -c 4 /dev/urandom | xxd -p)"
GROUP="${NANOCLAW_GROUP_FOLDER}"
NOW=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
SINCE=$(date -u -v-7d +%Y-%m-%d)

cat > "/workspace/ipc/tasks/$(date +%s)-$(head -c 4 /dev/urandom | xxd -p).json" <<EOF
{
  "type": "last30days_thread_search",
  "requestId": "${REQ_ID}",
  "query": "(\"drop your product\" OR \"share your product\" OR \"show me what you built\" OR \"drop your project\" OR \"what are you shipping\" OR \"what are you building\") min_replies:50 since:${SINCE}",
  "groupFolder": "${GROUP}",
  "timestamp": "${NOW}"
}
EOF

# Wait for result (poll every 2s, up to 10 min)
for i in $(seq 1 300); do
  if [ -f "/workspace/ipc/last30days_results/${REQ_ID}.json" ]; then
    cat "/workspace/ipc/last30days_results/${REQ_ID}.json"
    rm "/workspace/ipc/last30days_results/${REQ_ID}.json"
    break
  fi
  sleep 2
done
```

#### Important
- Each research call takes 1-5 minutes — be patient waiting for results
- The result is a JSON object: `{ "success": true, "message": "...research output..." }`
- Read the **full** message content — it contains X posts with engagement stats, quotes, and handles
- If a request fails or times out, try again
- **Only use the thread search IPC call defined above.** Do not run any `last30days_research` searches or invent additional search queries. All product discovery must come from the thread search results.

### Step 2: Extract ALL Products

Extract every product from every thread reply. Do not filter by quality, engagement, or relevance — include everything. For each reply that contains a URL:
1. Visit the URL to understand what the product actually does
2. Note the product name, one-line description, and who it's for
3. Skip replies that are just bare links with no product behind them (dead pages, login walls, empty SPAs)

### Step 3: Categorize into Problem Categories

Group all products into problem categories. Each category should represent a real problem that multiple builders are trying to solve.

If a category has fewer than 3 products, fold it into the most related category or drop the products into a general "Other" section at the end. Prefer fewer, thicker categories over many thin ones.

---

## Output Format

Save to `resources/intelligence/weekly-products/YYYY-MM-DD.md`.

The output is a **raw list** — no editorial analysis, no engagement data. Engagement (replies, likes) is used only to SELECT threads in Step 1; it must never appear in the output in any form.

```
# This Week in Indie Product Threads

**Weekly Product Briefing — [Month] [D], [YYYY] · Edition [N]**

*Every Saturday, a self-hosted AI agent I run scrapes the week's high-engagement "share your product" threads on X, extracts the product links, fetches and verifies the product pages, and compiles this list — about [N] confirmed products this week. Categories persist week to week. No sponsors, no affiliate links, no products I have a stake in.*

---

## [Category Name]

- [Product Name](url) — one plain sentence on what it does; append pricing if known (e.g. "free tier, from $29/mo")
- [repeat for each product in category]

[Repeat for each category, sorted by number of products — largest first. Keep category names consistent with prior weeks where they overlap.]

## Everything Else

- [Products that don't cluster into a category, same one-line format]

---

*Compiled weekly by an autonomous agent pipeline I built and self-host.*
```

Edition number: count existing files in `resources/intelligence/weekly-products/` (excluding `_archive`) that are on or after 2026-07-11, plus this one. (Edition 1 = 2026-07-11.)

Do NOT include: per-product engagement counts or @handles, "Who it's for" / "Problem it's solving" / "What's being built" / "Engagement signal" sections, summary observations, or a sources log.

---

## After Saving

Once the briefing file is written, commit and push to GitHub:

```bash
cd /Users/mattli/second-brain
git add -A
git commit -m "Add weekly product briefing for YYYY-MM-DD"
git push
```

Replace `YYYY-MM-DD` with today's actual date.
