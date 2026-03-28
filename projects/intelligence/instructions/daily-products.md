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

## Research Method: last30days IPC Tool

Your primary research tool is the **last30days engine**, accessed via IPC. It searches X (Twitter) for real-time product/builder signal.

### How to Run Research

For each topic, write a JSON file to `/workspace/ipc/tasks/` and poll for results:

```bash
# Generate unique request ID
REQ_ID="l30d-$(date +%s)-$(head -c 4 /dev/urandom | xxd -p)"
GROUP="${NANOCLAW_GROUP_FOLDER}"
NOW=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)

# Write IPC request
cat > "/workspace/ipc/tasks/$(date +%s)-$(head -c 4 /dev/urandom | xxd -p).json" <<EOF
{
  "type": "last30days_research",
  "requestId": "${REQ_ID}",
  "topics": "TOPIC_HERE",
  "flags": "--search x",
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

### Research Topics

Run exactly 3 IPC requests with these topics:

1. `"topics": "buildinpublic ||| building in public"` — catches the hashtag and natural phrasing
2. `"topics": "MRR"` — revenue milestones, indie traction
3. `"topics": "claude code"` — AI coding tools

### Important
- Each research call takes 1-5 minutes — be patient waiting for results
- The result is a JSON object: `{ "success": true, "message": "...research output..." }`
- Read the **full** message content — it contains X posts with engagement stats, quotes, and handles
- If a request fails or times out, try again with a simpler/shorter topic
- Use `--search x` to search X only (default is Reddit + X)

---

## Synthesizing Results

After collecting research from last30days:

1. **Read all the raw data carefully.** Pay attention to exact product names, @handles, engagement metrics (likes, reposts), and direct quotes.
2. **Do not substitute your own knowledge for what the research says.** Ground everything in the actual data returned.
3. **Pool all results from all searches into a single list.** Rank by engagement (likes, reposts, multiple independent mentions) across all keywords. Do not feel obligated to include items from every keyword — if one search returned only low-signal posts, skip it entirely.
4. **Minimum engagement threshold:** Skip any post with fewer than 10 likes unless it has multiple independent mentions or is from a notably established account. A 5-like post should never make the briefing when 30+ like posts exist in another search.
5. **Select the top 3-5 products/projects** from the combined, globally ranked list.

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

*Source: X — @handle (N likes), @handle2 (N reposts)*

[Repeat for 3–5 products]

---

## Today's Signal
[1–2 sentences synthesizing what today's product activity reveals — what kinds of problems are builders choosing to solve, what does the pattern of launches suggest about where the market is heading?]

---

## Sources Log
| Source | Searched | Items Used |
|--------|----------|------------|
| X (via last30days) | ✅/❌ | [product names or "(nothing new)"] |
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
