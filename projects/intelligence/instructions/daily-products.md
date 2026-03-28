Daily Product Briefing — Instructions

> Version: 2.0 | Last updated: 2026-03-26

## Purpose
Each morning, research and compile a concise product intelligence briefing focused on what builders and product people are actively shipping, discussing, and excited about. The output should be readable in approximately 2 minutes and saved to `projects/intelligence/product-briefings/YYYY-MM-DD.md` using today's actual date.

Cover 3–5 of the most interesting products, tools, or projects gaining traction in the last 24 hours. Quality over quantity — skip anything that is not genuinely interesting or new.

**Overlap Prevention:** Only include a product or project if it launched or gained significant new traction in the last 24 hours. Do not include items simply because they are still being discussed. If something was covered yesterday and nothing new has happened, skip it.

**Empty Sections:** If a source has no genuinely significant activity in the last 24 hours, move on. Never pad with low-signal content.

---

## Before You Start

Read the last 5 product briefings from `projects/intelligence/product-briefings/` (by date, most recent first). Note which products, tools, and projects were already covered. Do not include any of these today unless there is a genuinely new development.

---

## Research Method: X Thread Replies via last30days IPC

Search for "drop your product" threads on X and scrape replies containing product URLs. This catches products that builders promote in community threads.

```bash
REQ_ID="thread-$(date +%s)-$(head -c 4 /dev/urandom | xxd -p)"
GROUP="${NANOCLAW_GROUP_FOLDER}"
NOW=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)

cat > "/workspace/ipc/tasks/$(date +%s)-$(head -c 4 /dev/urandom | xxd -p).json" <<EOF
{
  "type": "last30days_thread_search",
  "requestId": "${REQ_ID}",
  "keywords": "drop your product ||| share your product ||| show me what you built",
  "days": 1,
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
- If a request fails or times out, try again with a simpler/shorter topic
- The thread search does two phases internally (find threads, then fetch replies) — just wait for the single result

---

## Synthesizing Results

After collecting thread replies:

1. **Read all the raw data carefully.** Pay attention to exact product names, @handles, engagement metrics (likes, reposts), product URLs, and what the builder says about their product.
2. **Do not substitute your own knowledge for what the research says.** Ground everything in the actual data returned.
3. **Rank replies by engagement** (likes, reposts) and quality of the product pitch. Products that include a working URL and a clear description of what they do rank higher.
4. **Select the top 3-5 products** from the ranked list.

---

## Output Format

Save to `projects/intelligence/product-briefings/YYYY-MM-DD.md`. Use this structure:

```
# Product Briefing — YYYY-MM-DD

## [Product or Project Name]
**Who has this problem?** [developer / PM / non-technical user / enterprise team / etc.]
**What problem does it attempt to solve?**
**Is the solution complete, or does it address only part of the pain?**
**What would a better solution look like?**

*Source: X thread reply — @handle (N likes) | Thread: @thread_starter "drop your product"*

[Repeat for 3–5 products]

---

## Today's Signal
[1–2 sentences synthesizing what today's product activity reveals — what kinds of problems are builders choosing to solve, what does the pattern of launches suggest about where the market is heading?]

---

## Sources Log
| Source | Searched | Items Used |
|--------|----------|------------|
| X — thread replies ("drop your product") | ✅/❌ | [product names or "(nothing new)"] |
```

---

## After Saving

Once the briefing file is written, commit and push it to GitHub:

```bash
cd /Users/mattli/second-brain
git add -A
git commit -m "Add product briefing for YYYY-MM-DD"
git push
```

Replace `YYYY-MM-DD` with today's actual date.

<!-- ARCHIVED: Original v1.0 sources (Product Hunt, HN, GitHub Trending, Indie Hackers via web search)
     Replaced with last30days X research in v2.0. Restore these if reverting. -->
