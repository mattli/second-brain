---
run_date: 2026-04-28
run_start: "2026-04-28T01:00:00Z"
run_end: "2026-04-28T01:45:00Z"
updated_after: "2026-04-13T00:00:00Z"
items_total: 107
workers_dispatched: 76
tier_c_referenced: 0
tier_d_bookmarked: 9
---

# List-Maker Run — 2026-04-28

## Run Notes

First real list-maker run after bootstrapping the per-doc pipeline. Used `updated_after: 2026-04-13T00:00:00Z` from the seed log entry — this covers the full backlog from the monolithic compiler's failure period.

107 items fetched across 2 pages. 8 items were already synthesized in `unorganized.md` by the previous monolithic compiler run — skipped as `already_in_wiki`. 3 duplicates within the batch. 1 old save updated but already in wiki.

Capacity guardrail triggered: 86 eligible items × ~3 min = 258 min, exceeding 240-min window. Deferred 10 newest items (Apr 26–28) to carry-over; dispatched 76.

Created 1 new page: `landscape/ai-economics.md` — justified by 3 Stanford MS&E 435 lectures sharing the same topic with no existing page within 1 hop.

## Workers Dispatched

| Doc ID | Tier | Hint | Target | Rationale |
|--------|------|------|--------|-----------|
| 01kp3jeshwkvwct51c0xe9ksks | A | update | tools/agent-harness.md | SMB "Peggy" Claude agent case study — extends existing Peggy reference |
| 01kp3jrg6ygjara31a1d3bby20 | A | update | landscape/ai-startup-distribution.md | Matt Gray digital product launch framework |
| 01kp3jsvnzegvxj5jh1my1qzmw | A | update | landscape/services-as-software.md | Full-cycle AI agency setup playbook (5K words) |
| 01kp3jtn3ta233mgn239pntnqr | A | update | landscape/ai-careers.md | AI skills gap paradox — more jobs, fewer qualified people |
| 01kp3jvmyq1st43b9p5c9a51t1 | A | update | writing/writing-craft.md | Dickie Bush Atomic Essays method for audience building |
| 01kp3jxjdztz6b3c71rft3m3g1 | A | update | writing/writing-craft.md | Jason Cohen "Specificity" essay |
| 01kp3phcw9bm0zq7xbnvpn2anr | B | update | landscape/yc-ai-thesis.md | Keith Rabois (Khosla) podcast — 21K words, VC perspective on AI era |
| 01kp3pkkb0yv9zw9saddrn0qtn | A | update | writing/writing-craft.md | Communication as career leverage |
| 01kp3z0278zcac3g99twtdnvra | A | update | concepts/llm-knowledge-bases.md | Claude-Obsidian personal knowledge system setup |
| 01kp48y9p8a4h4se9tjkd7xnhm | A | update | tools/ai-native-product-development.md | "Why Your AI-First Strategy Is Probably Wrong" |
| 01kp4pyhejfgvvnbcj5b63bb4s | A | update | landscape/ai-startup-distribution.md | Pain-first business ideation (12K words) |
| 01kp53d0v4sq1et48t3tvt0cb0 | A | update | concepts/llm-knowledge-bases.md | "Context Engineering killed RAG" |
| 01kp6bxhqwxrxeyzmqxcgecckf | A | update | tools/ai-native-product-development.md | Ann Miura-Ko on AI-pilled compounding startups |
| 01kp6fqx7zex7arx1d78gzwqqv | A | update | landscape/ai-careers.md | Agentalent.ai — AI agent hiring marketplace |
| 01kp7rdkrm3cmwwhz6fgmw55dx | A | update | concepts/agent-proficiency.md | Aaron Levie on enterprise AI agent deployer role |
| 01kp7rephwpr5g0ekhd7e4tq5a | A | update | concepts/business-moats-in-ai.md | "The Last Moat Standing" — opinionated perspective moat |
| 01kp7rh22xb7v6anx5xvc2hgba | A | update | landscape/ai-organization-design.md | "From Hierarchy to Intelligence" — Roelof Botha / Block model |
| 01kp7sb48y8y2g5wyymhp889cw | A | update | tools/ai-native-product-development.md | Owner "Delta Force" product team model (4K words) |
| 01kp7t1av5skqrdz6q6rn91093 | A | update | landscape/ai-startup-distribution.md | AI replacing marketing org charts |
| 01kp7t39w88qrndbq1wyp2xbss | A | update | concepts/llm-knowledge-bases.md | "RAG is broken" — Semantic Collapse in high-dimensional RAG |
| 01kp99rr70v7kcdwh1mwhzq4fz | A | update | tools/agent-harness.md | "Resolvers" — resolver concept for agent skill routing |
| 01kp9femfja3z2j2mccccpdetx | A | update | landscape/ai-startup-distribution.md | "Distribution Engineer" role replacing traditional marketing |
| 01kp9fgstqf51gh2mj0xzhhkgr | A | update | concepts/llm-knowledge-bases.md | "Every AI Memory Tool" — two camps (fact store vs context file) |
| 01kp9j93h49rv7b0jag6nsvf75 | A | update | landscape/services-as-software.md | "How to Build Services-as-Software" — manual-first playbook |
| 01kp9wr8504v6s5z6szqrgtdat | A | update | landscape/services-as-software.md | "Services: The New Software" — AI autopilots selling services |
| 01kpah19hcnayfkapk8g1z6jpr | A | update | concepts/physical-ai.md | "Frontier Systems for the Physical World" (5K words) |
| 01kpbs3ad7vd2spbc27qmqvjrs | A | update | tools/agentic-engineering.md | "Not all AI agents are created equal" — agent taxonomy |
| 01kpe6bgpme4prydcwj0wa54pv | A | update | tools/ai-native-product-development.md | "2× — nine months later" — doubling R&D productivity with AI |
| 01kpeqg89c86bsyxd8cspm6n9v | A | update | landscape/ai-organization-design.md | "Founder Mode is dead" — Architect Mode with AI |
| 01kpevwac05ayz3z56ghww6z9f | A | update | models-safety/frontier-models.md | Nathan Lambert tweet on open vs closed model dynamics |
| 01kpevwnk2wr12wk52yacagwvj | A | update | models-safety/frontier-models.md | "My bets on open models, mid-2026" — Nathan Lambert |
| 01kpew5dcmqcmhn9fxmfkxdzfw | A | update | tools/ai-native-product-development.md | "Output isn't design" — design thinking vs AI output |
| 01kpewgzpa0j1kx9h98apbrfpk | A | update | tools/agentic-engineering.md | "Living Software" — living vs stable software paradigm |
| 01kpexnw6jny3se7zvf3bebmad | A | update | models-safety/ai-safety-interpretability.md | "Building the field of AI safety" — talent pipeline |
| 01kpf51kfed7y92ckvsbv2ppyn | A | update | concepts/world-models.md | Yann LeCun on open source AI, risks, Meta's approach |
| 01kpf7qar1f3e7kh6td9d5m0zh | A | update | concepts/business-moats-in-ai.md | "The AI SaaS Squeeze" (4K words) |
| 01kpgge80dz4t9abven7hfeadr | A | update | landscape/services-as-software.md | "$1T for agent-first startups" — Greg Isenberg |
| 01kpj2596afjsxvagha99f548r | A | update | models-safety/ai-safety-interpretability.md | Amanda Askell on Claude's psychology/anxiety |
| 01kpj293v26sfkne63hvmynawt | A | update | landscape/vertical-ai.md | "Mark Cuban Is Right About AI Agents" — vertical focus |
| 01kpk5tw76d7326nnwd0fbvw95 | A | update | landscape/ai-startup-distribution.md | Claude MCP + LinkedIn outreach playbook |
| 01kpk927p4cd3gcbrhn1emn4qe | A | update | tools/agent-harness.md | Garry Tan on naked LLMs vs harnessed systems |
| 01kpkbnrbtsnf343yb7z757ar3 | A | update | tools/agent-harness.md | "A harnessed LLM agent" — harness components |
| 01kpkbmbdnd3rt531bhpagkrzv | A | update | tools/agentic-engineering.md | Robert Scoble on X.com enabling AI agent app building |
| 01kpmbgvtg6e7athyk40nq0zt6 | A | update | concepts/llm-knowledge-bases.md | "Your company needs a brain, not more connectors" |
| 01kpnzjdw0b1fvepmgax0nzk7w | A | update | concepts/knowledge-work-future.md | "Agents, robots, and us" McKinsey report (8.7K words) |
| 01kppzch8xp6k3a1ez6ryjn5vq | A | update | concepts/llm-knowledge-bases.md | "Prompt caching in LLMs" — 92% cache hit rate |
| 01kpq14a0khpbx6q7xs0fcrjfj | A | update | concepts/knowledge-work-future.md | Elad Gil on AI as growing share of US economy |
| 01kpq16478a9x571z4ahbc04gr | A | update | concepts/knowledge-work-future.md | Lenny Rachitsky / Nikhyl Singhal — PM role evolution |
| 01kpq1k1zybxqw9nnspxj0ctzv | A | update | concepts/knowledge-work-future.md | "Why half of product managers are in trouble" — Lenny's Podcast |
| 01kpq2qf6anywk90559qkbhh46 | A | update | landscape/venture-capital-access.md | "The Narrow Path" — seed investing strategy |
| 01kpq3wdx5k17nx0jh37sp04j0 | A | update | landscape/services-as-software.md | "1-Person AI Agency Model" — $20K/month solo operator |
| 01kpq3x3rz7nj06qc023h11hzw | A | update | tools/agentic-engineering.md | "50 AI Automations You Can Build This Weekend" |
| 01kpq3z8g137tw1hwagmz1fv3e | A | update | concepts/llm-knowledge-bases.md | "AI Knowledge Layer" (10.6K words) — structured knowledge layer |
| 01kpr6d23v5k5ndk0pftceg7n6 | A | update | concepts/knowledge-work-future.md | "What will be scarce?" — economics of AI structural change (5.3K words) |
| 01kpr6d8wtkrq4g0q16w55ysx5 | A | update | concepts/knowledge-work-future.md | Alex Imas tweet — relational economy thesis |
| 01kpr6hwck9v95737xwrpyedc9 | A | update | landscape/ai-startup-distribution.md | Dickie Bush $100K digital product ideas framework |
| 01kpr9baeh4vqm919ax9ek2f80 | A | update | culture/internet-as-mediating-layer.md | "The Internet is Real Life" — Erik Torenberg |
| 01kps503xa73jxa4ec7758k15r | A | update | tools/agentic-engineering.md | "Companies aren't ready for AI agents" — fleet governance |
| 01kps5dd71ej34rt2jfcdpc1ye | A | update | concepts/knowledge-work-future.md | "Running Faster to Go Nowhere" — Red Queen effect |
| 01kpsbd6c1p4pfssbs0cjmm9tq | A | update | concepts/model-quantization.md | "AI 101: What Is a Token" — token fundamentals |
| 01kptq9kpcbq1hp9dg2c89v32t | A | update | tools/agent-harness.md | "How to really stop agents from making same mistakes" — failures → tested skills |
| 01kpvhrvbm95ch4kexbc8af9qs | A | update | culture/museum-design-curation.md | "Inside LACMA's Eye-Popping New Home" — NYT review |
| 01kpvhttewyst6rnd70cwasd1y | A | update | tools/agent-harness.md | "Harness Engineering from Top AI Companies" |
| 01kpvjgtyrxm68denmszgxq4nb | A | update | writing/writing-craft.md | "The Art of Not Sounding Like an Idiot" — eloquence |
| 01kpvmm9w639qx6t72vx2g2tjg | A | update | tools/claude-code-skill-frameworks.md | "Compound Engineering v3" — naming, paper trail, review |
| 01kpvrjf91qc0azvh1n7ga1b3j | A | create | landscape/ai-economics.md | Stanford MS&E 435 Class #1 — AI Supercycle economics |
| 01kpvrk2agmwbax94d13zh6htt | A | update | landscape/ai-economics.md | Stanford MS&E 435 Class #2 — compute scaling |
| 01kpvrk7zdmce4vcwsn4h3tqnm | A | update | landscape/ai-economics.md | Stanford MS&E 435 Class #3 — data centers, energy |
| 01kpvwc65529ebhfveansnnjtc | A | update | landscape/venture-capital-access.md | Naval's USVC — $500 minimum VC investing |
| 01kpxw1ksw2sjxxe2k1sq2tx24 | A | update | tools/agent-harness.md | "The Bitter Lesson of Agent Harnesses" — direct CDP access |
| 01kpyx5k61pm84hkrjn9fpnnj6 | A | update | tools/claude-code-skill-frameworks.md | "Skill Graphs 2.0" — atoms/molecules/compounds |
| 01kpyry1mjjchwxw1457x05jhf | A | update | landscape/ai-startup-distribution.md | Open-sourced AI marketing playbook (2.1K stars) |
| 01kpyyxyw2t1n9ey671w2w00ev | A | update | tools/ai-native-product-development.md | Anthropic product team — Lenny's Podcast with Cat Wu |
| 01kpzxn47zmq4f8s4prhtd593p | A | update | landscape/venture-capital-access.md | "USVC is a watershed moment" — Hari Raghavan |
| 01kq0a1yank7gvrrqxseeby31b | A | update | tools/agent-harness.md | "Definitive Guide to Harness Engineering" (3.3K words) |
| 01kq1ea2js67vhvxhf3kwwv3f0 | A | update | music/beatles-early-period.md | Pollack's "Notes On..." Beatles compositional analysis |

## Tier C — References Added

| Title | Words | Added To |
|-------|-------|----------|
| (none this run) | | |

## Tier D — Bookmarks Added

| Title | Added To |
|-------|----------|
| April 10, 2026 (Readwise changelog) | unorganized.md |
| "ok this startup is cool but …" (Andrew Chen) | unorganized.md |
| "the difference between 'why isn't this selling'…" (The Boring Marketer) | unorganized.md |
| How I created OpenClaw (Peter Steinberger) | unorganized.md |
| April 17, 2026 (Readwise changelog) | unorganized.md |
| We've partnered with @Vercel (NanoClaw) | unorganized.md |
| Here's YC's official advice about being truthful… (Garry Tan) | unorganized.md |
| YC on how to build a company with AI from… (Ben Lang) | unorganized.md |
| April 24, 2026 (Readwise changelog) | unorganized.md |

## Skipped

| ID | Title | Reason |
|----|-------|--------|
| — | Jesse's Blueberry Chia Seed Pudding | already_in_wiki (unorganized.md) |
| — | (Perplexity) Comet | already_in_wiki (unorganized.md) |
| — | Ghostty | already_in_wiki (unorganized.md) |
| — | x-bookmarks.com | already_in_wiki (unorganized.md) |
| — | App Growth Formula | already_in_wiki (unorganized.md) |
| — | Gabor Maté: Psychology Behind Power, Narcissism & Trump | already_in_wiki (unorganized.md) |
| — | Introducing Claude Opus 4.7 | already_in_wiki (unorganized.md) |
| — | Neuromarketing & Meta Tribe V2 | already_in_wiki (unorganized.md) |
| — | Reluctantly Influential: Inside Lenny Rachitsky's Life | already_in_wiki (unorganized.md) |
| — | The Future Of Everything Is Lies, I Guess | already_in_wiki (unorganized.md) |
| — | Humanity Is About to Fork | already_in_wiki (unorganized.md) |
| — | (3 duplicate_in_run items) | duplicate_in_run |

## Carry-Over (deferred to next run)

| Doc ID | Tier | Reason |
|--------|------|--------|
| 01kq3rxa7f3wseddz5dz0tsrts | A | capacity — deferred newest items |
| 01kq56qhvvnj9ew1308w3pdknf | A | capacity — deferred newest items |
| 01kq5r2s2mrawb5s36reekekmt | A | capacity — deferred newest items |
| 01kq6h5qsge0qe28ebmf4mnvg5 | A | capacity — deferred newest items |
| 01kq6mz4x91wqhw6y95zv9vzyt | A | capacity — deferred newest items |
| 01kq6mzew7mgdzkg1fabjpd0xj | A | capacity — deferred newest items |
| 01kq7xnzhnvvfqkqqcegkcq25k | A | capacity — deferred newest items |
| 01kq881g9mf0dfc4nzk8eyywt1 | A | capacity — deferred newest items |
| 01kq91yeyka4q9b2mf5ffggrhh | A | capacity — deferred newest items |
| 01kq94qb0pnn2gj7j1kk1f4m12 | A | capacity — deferred newest items |
