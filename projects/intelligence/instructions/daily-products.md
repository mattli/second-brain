Daily Product Briefing — Instructions

> Version: 2.0 | Last updated: 2026-03-27

## Purpose
Each morning, research and compile a concise product intelligence briefing focused on what builders and product people are actively shipping, discussing, and excited about. The output should be readable in approximately 2 minutes and saved to `projects/intelligence/product-briefings/YYYY-MM-DD.md` using today's actual date.

Cover 3–5 of the most interesting products, tools, or projects gaining traction in the last 24 hours. Quality over quantity — skip anything that is not genuinely interesting or new.

**Overlap Prevention:** Only include a product or project if it launched or gained significant new traction in the last 24 hours. Do not include items simply because they are still being discussed. If something was covered yesterday and nothing new has happened, skip it.

**Empty Sections:** If a source has no genuinely significant activity in the last 24 hours, move on. Never pad with low-signal content.

---

## Before You Start

Read the last 5 product briefings from `projects/intelligence/product-briefings/` (by date, most recent first). Note which products, tools, and projects were already covered. Do not include any of these today unless there is a genuinely new development.

---

## Research Methods

### Source 1: X Thread Replies via last30days IPC

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
- Run the IPC request and the Product Hunt web search in parallel to save time

### Source 2: Product Hunt (web search)

Search for today's Product Hunt daily leaderboard using web search. Find the top 5 products launched today with their upvote counts.

---

## Synthesizing Results

Keep the two sources **separate** in the output — do not merge them into one list. Each source gets its own section:

1. **X Thread Replies**: Read all reply data carefully. Rank by engagement and quality of pitch. Select the top 3-5 products with working URLs.
2. **Product Hunt**: List the top 3-5 products from today's leaderboard with upvote counts and a one-line summary of what each does.

---

## Output Format

Save to `projects/intelligence/product-briefings/YYYY-MM-DD.md`. Use this structure:

```
# Product Briefing — YYYY-MM-DD

## Product Hunt: Top Launches

### [Product or Project Name]
**Who has this problem?** [developer / PM / non-technical user / enterprise team / etc.]
**What problem does it attempt to solve?**
**Is the solution complete, or does it address only part of the pain?**
**What would a better solution look like?**

*Source: Product Hunt — #N (N upvotes)*

[Repeat for 3–5 products]

---

## X: Indie Builder Threads

### [Product or Project Name]
**Who has this problem?** [developer / PM / non-technical user / enterprise team / etc.]
**What problem does it attempt to solve?**
**Is the solution complete, or does it address only part of the pain?**
**What would a better solution look like?**

*Source: X thread reply — @handle (N likes) | Thread: @thread_starter "drop your product"*

[Repeat for 3–5 products]

---

## Today's Signal
[1–2 sentences synthesizing what today's product activity reveals across both sources]

---

## Sources Log
| Source | Searched | Items Used |
|--------|----------|------------|
| X — thread replies ("drop your product") | ✅/❌ | [product names or "(nothing new)"] |
| Product Hunt — daily leaderboard | ✅/❌ | [product names or "(nothing new)"] |
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
